export type WebSocketCallback<T = unknown> = (data: T) => void;

class SocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<WebSocketCallback<unknown>>> = new Map();
  private isConnecting: boolean = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Determine the WS URL (ws:// or wss://)
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_URL ? new URL(process.env.NEXT_PUBLIC_WS_URL).host : "localhost:8080";
    this.url = `${protocol}//${host}/ws`;
  }

  public connect(): WebSocket {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return this.socket;
    }

    if (this.isConnecting) {
      return this.socket as WebSocket; // It's currently connecting
    }

    this.isConnecting = true;
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.isConnecting = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          topic?: string;
          event?: string;
          data?: unknown;
        };
        const { topic, data } = payload;
        
        if (topic && this.listeners.has(topic)) {
          this.listeners.get(topic)?.forEach((callback) => callback(data));
        } else if (payload.event && this.listeners.has(payload.event)) {
          // Alternate server event shape.
          this.listeners.get(payload.event)?.forEach((callback) => callback(payload.data ?? payload));
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
      this.isConnecting = false;
      this.socket = null;
      this.scheduleReconnect();
    };

    this.socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return this.socket;
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      console.log("Attempting WebSocket reconnection...");
      this.connect();
    }, 3000);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  public subscribe<T>(topic: string, callback: WebSocketCallback<T>): () => void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)!.add(callback as WebSocketCallback<unknown>);

    // Send a subscribe intent to the server if needed
    if (this.socket?.readyState === WebSocket.OPEN) {
       this.socket.send(JSON.stringify({ action: "subscribe", topic }));
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(topic);
      if (callbacks) {
        callbacks.delete(callback as WebSocketCallback<unknown>);
        if (callbacks.size === 0) {
          this.listeners.delete(topic);
          if (this.socket?.readyState === WebSocket.OPEN) {
             this.socket.send(JSON.stringify({ action: "unsubscribe", topic }));
          }
        }
      }
    };
  }
}

export const socketManager = new SocketManager();
