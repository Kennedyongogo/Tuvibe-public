/**
 * Enhanced fetch utility optimized for slow networks
 * - Automatic timeouts
 * - Retry logic with exponential backoff
 * - Request cancellation
 * - Offline detection
 * - Request prioritization
 */

// Network quality detection
let networkQuality = 'unknown';
let isOnline = navigator.onLine;

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    networkQuality = 'good';
  });
  
  window.addEventListener('offline', () => {
    isOnline = false;
    networkQuality = 'offline';
  });
}

// Detect network quality based on connection API
if (typeof navigator !== 'undefined' && navigator.connection) {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    const updateNetworkQuality = () => {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink;
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
        networkQuality = 'slow';
      } else if (effectiveType === '3g' || downlink < 1.5) {
        networkQuality = 'medium';
      } else {
        networkQuality = 'good';
      }
    };
    
    updateNetworkQuality();
    connection.addEventListener('change', updateNetworkQuality);
  }
}

// Timeout values based on network quality
const getTimeout = (defaultTimeout = 10000) => {
  if (!isOnline) return 2000; // Fail fast when offline
  if (networkQuality === 'slow') return defaultTimeout * 2; // 20s for slow
  if (networkQuality === 'medium') return defaultTimeout * 1.5; // 15s for medium
  return defaultTimeout; // 10s for good
};

// Retry configuration based on network
const getRetryConfig = () => {
  if (!isOnline) return { maxRetries: 0, baseDelay: 0 };
  if (networkQuality === 'slow') return { maxRetries: 2, baseDelay: 2000 };
  if (networkQuality === 'medium') return { maxRetries: 1, baseDelay: 1000 };
  return { maxRetries: 1, baseDelay: 500 };
};

/**
 * Fetch with timeout, retry, and cancellation support
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} options.timeout - Request timeout in ms (default: based on network)
 * @param {number} options.maxRetries - Max retry attempts (default: based on network)
 * @param {number} options.retryDelay - Base delay between retries in ms
 * @param {boolean} options.retryOnTimeout - Whether to retry on timeout (default: true)
 * @param {AbortSignal} options.signal - AbortSignal for cancellation
 * @param {string} options.priority - Request priority: 'high', 'medium', 'low' (default: 'medium')
 * @returns {Promise<Response>}
 */
export const fetchWithTimeout = async (url, options = {}) => {
  const {
    timeout,
    maxRetries,
    retryDelay,
    retryOnTimeout = true,
    signal: externalSignal,
    priority = 'medium',
    ...fetchOptions
  } = options;

  // Check offline status
  if (!isOnline) {
    throw new Error('Network request failed: Device is offline');
  }

  // Get network-adaptive configuration
  const requestTimeout = timeout || getTimeout();
  const retryConfig = getRetryConfig();
  const finalMaxRetries = maxRetries !== undefined ? maxRetries : retryConfig.maxRetries;
  const finalRetryDelay = retryDelay || retryConfig.baseDelay;

  // Create abort controller for timeout
  let timeoutId;
  let abortController = new AbortController();
  
  // Combine with external signal if provided
  if (externalSignal) {
    if (externalSignal.aborted) {
      throw new Error('Request aborted');
    }
    externalSignal.addEventListener('abort', () => {
      abortController.abort();
    });
  }

  const attemptFetch = async (attempt = 0) => {
    try {
      // Create timeout
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          abortController.abort();
          reject(new Error(`Request timeout after ${requestTimeout}ms`));
        }, requestTimeout);
      });

      // Make the request
      const fetchPromise = fetch(url, {
        ...fetchOptions,
        signal: abortController.signal,
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      clearTimeout(timeoutId);
      
      // Check if response is ok
      if (!response.ok && response.status >= 500 && attempt < finalMaxRetries) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Don't retry if aborted or offline
      if (error.name === 'AbortError' && !retryOnTimeout) {
        throw error;
      }
      
      if (!isOnline) {
        throw new Error('Network request failed: Device is offline');
      }
      
      // Retry logic
      if (attempt < finalMaxRetries) {
        const delay = finalRetryDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Create new abort controller for retry
        abortController = new AbortController();
        if (externalSignal && !externalSignal.aborted) {
          externalSignal.addEventListener('abort', () => {
            abortController.abort();
          });
        }
        
        return attemptFetch(attempt + 1);
      }
      
      throw error;
    }
  };

  return attemptFetch();
};

/**
 * Fetch JSON with automatic parsing and error handling
 */
export const fetchJSON = async (url, options = {}) => {
  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { response, data };
  } catch (error) {
    // Provide more context in error
    if (error.message.includes('timeout')) {
      throw new Error(`Request to ${url} timed out. Please check your connection.`);
    }
    if (error.message.includes('offline')) {
      throw new Error('You are offline. Please check your internet connection.');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to reach server. Please check your connection.');
    }
    throw error;
  }
};

/**
 * Request queue for prioritizing requests on slow networks
 */
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = networkQuality === 'slow' ? 2 : 4;
    this.activeRequests = 0;
  }

  async add(requestFn, priority = 'medium') {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        priority,
        resolve,
        reject,
      });
      
      // Priority order: high > medium > low
      this.queue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      this.process();
    });
  }

  async process() {
    if (this.processing || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const item = this.queue.shift();
      this.activeRequests++;

      item.requestFn()
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          this.activeRequests--;
          this.process();
        });
    }

    this.processing = false;
  }
}

export const requestQueue = new RequestQueue();

/**
 * Queued fetch - automatically queues requests on slow networks
 */
export const fetchQueued = async (url, options = {}) => {
  const priority = options.priority || 'medium';
  
  // On slow networks, use queue
  if (networkQuality === 'slow' || networkQuality === 'medium') {
    return requestQueue.add(
      () => fetchWithTimeout(url, options),
      priority
    );
  }
  
  // On good networks, fetch directly
  return fetchWithTimeout(url, options);
};

// Export network status
export const getNetworkStatus = () => ({
  isOnline,
  quality: networkQuality,
});

export default fetchWithTimeout;

