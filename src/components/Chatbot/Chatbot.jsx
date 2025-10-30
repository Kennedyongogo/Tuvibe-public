import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Fade,
  Slide,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Send,
  Close,
  Chat as ChatIcon,
  SmartToy,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
// Using fetch with proxy like other components

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Initial greeting message
  const initialMessage = {
    text: "Hello! I'm here to help you learn about Mwalimu Hope Foundation. How can I assist you today?",
    isBot: true,
    timestamp: null,
    intent: 'greeting'
  };
  
  const [messages, setMessages] = useState([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Reset messages when chat is opened
  const handleOpenChat = () => {
    setIsOpen(true);
    setMessages([initialMessage]);
    setError(null);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data;
      
      const botMessage = {
        text: data.reply,
        isBot: true,
        timestamp: new Date(),
        intent: data.intent,
        confidence: data.confidence
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setError('Sorry, I\'m having trouble connecting right now. Please try again later.');
      
      const errorMessage = {
        text: "I'm sorry, I'm having trouble connecting right now. Please contact us directly at mwalimuhopefoundation@gmail.com or call 0721660901.",
        isBot: true,
        timestamp: new Date(),
        intent: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How can I donate?",
    "What programs do you offer?",
    "How can I volunteer?",
    "What is your mission?",
    "Where are you located?",
    "How can I contact you?"
  ];

  const getIntentColor = (intent) => {
    const colors = {
      donation: '#4caf50',
      programs: '#2196f3',
      volunteer: '#ff9800',
      mission: '#e91e63',
      location: '#9c27b0',
      membership: '#00bcd4',
      events: '#ff5722',
      general: '#607d8b',
      error: '#f44336',
      greeting: '#4caf50'
    };
    return colors[intent] || '#607d8b';
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button */}
      <Fade in={!isOpen}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Tooltip title="Chat with Mwalimu AI Assistant" arrow>
            <IconButton
              onClick={handleOpenChat}
              sx={{
                background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
                color: 'white',
                width: 64,
                height: 64,
                boxShadow: '0 8px 32px rgba(30, 60, 114, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2a5298, #1e3c72)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ChatIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Fade>

      {/* Chat Window */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 420 },
            height: isMinimized ? 60 : 450,
            maxHeight: 'calc(100vh - 120px)', // Ensure it doesn't exceed viewport minus header and margins
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
            borderRadius: 3,
            overflow: 'hidden',
            transition: 'height 0.3s ease',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: isMinimized ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (isMinimized) {
                setIsMinimized(false);
                // Reset messages when expanding from minimized state
                setMessages([initialMessage]);
                setError(null);
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  width: 32,
                  height: 32,
                }}
              >
                <SmartToy sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                  Mwalimu AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                  {isMinimized ? 'Click to expand' : 'How can I help you?'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                sx={{ color: 'white', p: 0.5 }}
              >
                {isMinimized ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
              <IconButton
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                  // Reset messages when fully closed
                  setMessages([initialMessage]);
                  setError(null);
                }}
                sx={{ color: 'white', p: 0.5 }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {!isMinimized && (
            <>
              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
                }}
              >
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: message.isBot ? 'flex-start' : 'flex-end',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    {message.isBot && (
                      <Avatar
                        sx={{
                          background: getIntentColor(message.intent),
                          width: 28,
                          height: 28,
                          mt: 0.5,
                        }}
                      >
                        <SmartToy sx={{ fontSize: 16 }} />
                      </Avatar>
                    )}
                    
                    <Box
                      sx={{
                        maxWidth: '80%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.isBot ? 'flex-start' : 'flex-end',
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: message.isBot 
                            ? 'white'
                            : 'linear-gradient(45deg, #1e3c72, #2a5298)',
                          color: message.isBot ? 'text.primary' : 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          border: message.isBot ? '1px solid #e0e0e0' : 'none',
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            lineHeight: 1.5,
                            whiteSpace: 'pre-line',
                            fontSize: '0.875rem'
                          }}
                        >
                          {message.text}
                        </Typography>
                        
                        {message.intent && message.intent !== 'greeting' && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <Chip
                              label={message.intent}
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                height: 20,
                                background: getIntentColor(message.intent),
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                            {message.confidence && (
                              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                                {(message.confidence * 100).toFixed(0)}%
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                      
                      {message.timestamp && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            mt: 0.5, 
                            opacity: 0.6, 
                            fontSize: '0.7rem',
                            alignSelf: message.isBot ? 'flex-start' : 'flex-end'
                          }}
                        >
                          {formatTime(message.timestamp)}
                        </Typography>
                      )}
                    </Box>

                    {!message.isBot && (
                      <Avatar
                        sx={{
                          background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
                          width: 28,
                          height: 28,
                          mt: 0.5,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          U
                        </Typography>
                      </Avatar>
                    )}
                  </Box>
                ))}
                
                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 1 }}>
                    <Avatar
                      sx={{
                        background: '#607d8b',
                        width: 28,
                        height: 28,
                        mt: 0.5,
                      }}
                    >
                      <SmartToy sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CircularProgress size={16} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Thinking...
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <Box sx={{ p: 2, pt: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 500 }}>
                    Quick questions:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {quickQuestions.map((question, index) => (
                      <Chip
                        key={index}
                        label={question}
                        size="small"
                        onClick={() => setInputValue(question)}
                        sx={{
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                          background: 'rgba(30, 60, 114, 0.1)',
                          color: '#1e3c72',
                          border: '1px solid rgba(30, 60, 114, 0.2)',
                          '&:hover': {
                            background: '#1e3c72',
                            color: 'white',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', background: 'white' }}>
                {error && (
                  <Typography 
                    variant="caption" 
                    color="error" 
                    sx={{ 
                      display: 'block', 
                      mb: 1, 
                      textAlign: 'center',
                      fontSize: '0.75rem'
                    }}
                  >
                    {error}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    size="small"
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '0.875rem',
                      }
                    }}
                  />
                  <IconButton
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    sx={{
                      background: inputValue.trim() && !isLoading 
                        ? 'linear-gradient(45deg, #1e3c72, #2a5298)' 
                        : 'grey.300',
                      color: 'white',
                      p: 1,
                      '&:hover': {
                        background: inputValue.trim() && !isLoading 
                          ? 'linear-gradient(45deg, #2a5298, #1e3c72)' 
                          : 'grey.400',
                      },
                      '&:disabled': {
                        background: 'grey.300',
                        color: 'grey.500',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Send sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Slide>
    </>
  );
};

export default Chatbot;
