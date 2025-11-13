import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const NAMESPACE = "/suspensions";

const buildSocketOptions = (token, override = {}) => ({
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: { token },
  autoConnect: Boolean(token),
  ...override,
});

const useSuspensionSocket = ({
  token,
  enabled = true,
  eventHandlers,
  options,
} = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef(eventHandlers);
  const instanceRef = useRef(null);

  useEffect(() => {
    handlersRef.current = eventHandlers || {};
  }, [eventHandlers]);

  useEffect(() => {
    if (!enabled || !token) {
      if (instanceRef.current) {
        instanceRef.current.disconnect();
        instanceRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      return undefined;
    }

    const socketOptions = buildSocketOptions(token, options || {});
    const instance = io(NAMESPACE, socketOptions);
    instanceRef.current = instance;
    setSocket(instance);

    const handleConnect = () => {
      setIsConnected(true);
    };
    const handleDisconnect = (reason) => {
      console.log("[SuspensionSocket] disconnected:", reason);
      setIsConnected(false);
    };

    instance.on("connect", handleConnect);
    instance.on("disconnect", handleDisconnect);
    instance.on("connect_error", (error) => {
      console.error("[SuspensionSocket] connection error:", error.message);
    });

    const activeHandlers = Object.entries(handlersRef.current);
    activeHandlers.forEach(([event, handler]) => {
      if (typeof handler === "function") {
        instance.on(event, handler);
      }
    });

    return () => {
      activeHandlers.forEach(([event, handler]) => {
        if (typeof handler === "function") {
          instance.off(event, handler);
        }
      });
      instance.off("connect", handleConnect);
      instance.off("disconnect", handleDisconnect);
      instance.disconnect();
      if (instanceRef.current === instance) {
        instanceRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, enabled, options]);

  const joinSuspension = useCallback(
    (suspensionId, callback) => {
      if (!socket) return;
      socket.emit("suspension:join", { suspensionId }, (response) => {
        if (typeof callback === "function") {
          callback(response);
        }
        if (!response?.success) {
          console.error(
            "[SuspensionSocket] failed to join suspension:",
            response?.message
          );
        }
      });
    },
    [socket]
  );

  const leaveSuspension = useCallback(
    (suspensionId, callback) => {
      if (!socket) return;
      socket.emit("suspension:leave", { suspensionId }, (response) => {
        if (typeof callback === "function") {
          callback(response);
        }
        if (!response?.success) {
          console.error(
            "[SuspensionSocket] failed to leave suspension:",
            response?.message
          );
        }
      });
    },
    [socket]
  );

  const emit = useCallback(
    (event, payload, callback) => {
      if (!socket) return;
      socket.emit(event, payload, callback);
    },
    [socket]
  );

  return useMemo(
    () => ({
      socket,
      isConnected,
      joinSuspension,
      leaveSuspension,
      emit,
    }),
    [socket, isConnected, joinSuspension, leaveSuspension, emit]
  );
};

export default useSuspensionSocket;
