export type WebSocketCallback<T = unknown> = (data: T) => void;

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_MS = 3000;

function isWebSocketEnabled() {
  return process.env.NEXT_PUBLIC_WS_ENABLED === "true";
}

function resolveWebSocketUrl() {
  const raw = process.env.NEXT_PUBLIC_WS_URL;
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "ws:" || parsed.protocol === "wss:") {
      return parsed.toString();
    }

    const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
    const path =
      parsed.pathname && parsed.pathname !== "/"
        ? parsed.pathname
        : process.env.NEXT_PUBLIC_WS_PATH || "/api/v1/ws";
    return `${protocol}//${parsed.host}${path}`;
  } catch {
    return null;
  }
}

class SocketManager {
  private socket: WebSocket | null = null;
  private url: string | null;
  private listeners: Map<string, Set<WebSocketCallback<unknown>>> = new Map();
  private isConnecting = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private disabled = false;
  private warnedUnavailable = false;

  constructor() {
    this.url = resolveWebSocketUrl();
    if (!isWebSocketEnabled()) {
      this.disabled = true;
    }
  }

  public isEnabled() {
    return !this.disabled && Boolean(this.url);
  }

  public isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  public connect(): WebSocket | null {
    if (this.disabled || !this.url) return null;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return this.socket;
    }

    if (this.isConnecting) {
      return this.socket;
    }

    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.disableWithWarning("max reconnect attempts reached");
      return null;
    }

    this.isConnecting = true;

    try {
      this.socket = new WebSocket(this.url);
    } catch {
      this.isConnecting = false;
      this.handleConnectionFailure("invalid websocket url");
      return null;
    }

    this.socket.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.resubscribeAll();
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
          this.listeners.get(payload.event)?.forEach((callback) => callback(payload.data ?? payload));
        }
      } catch {
        // Ignore malformed frames.
      }
    };

    this.socket.onclose = () => {
      this.isConnecting = false;
      this.socket = null;
      this.reconnectAttempts += 1;

      if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        this.disableWithWarning("server closed connection");
        return;
      }

      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.isConnecting = false;
      this.handleConnectionFailure("connection failed");
    };

    return this.socket;
  }

  private handleConnectionFailure(reason: string) {
    this.reconnectAttempts += 1;

    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.disableWithWarning(reason);
      return;
    }

    this.scheduleReconnect();
  }

  private disableWithWarning(reason: string) {
    if (this.warnedUnavailable) return;
    this.warnedUnavailable = true;
    this.disabled = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    console.warn(
      `[CrikOptions] Live WebSocket unavailable (${reason}). Using HTTP polling and admin ball log instead.`,
      this.url ?? "no websocket url configured"
    );
  }

  private scheduleReconnect() {
    if (this.disabled || this.reconnectTimer) return;

    const delay = RECONNECT_BASE_MS * Math.min(this.reconnectAttempts, 3);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private resubscribeAll() {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    for (const topic of this.listeners.keys()) {
      this.socket.send(JSON.stringify({ action: "subscribe", topic }));
    }
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

    if (this.isEnabled()) {
      this.connect();
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ action: "subscribe", topic }));
      }
    }

    return () => {
      const callbacks = this.listeners.get(topic);
      if (!callbacks) return;

      callbacks.delete(callback as WebSocketCallback<unknown>);
      if (callbacks.size === 0) {
        this.listeners.delete(topic);
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ action: "unsubscribe", topic }));
        }
      }
    };
  }
}

export const socketManager = new SocketManager();
