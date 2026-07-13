export type WebSocketCallback<T = unknown> = (data: T) => void;
export type WebSocketConnectionState =
  | "disabled"
  | "connecting"
  | "authenticating"
  | "connected"
  | "reconnecting"
  | "unauthorized";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

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
  private connectionState: WebSocketConnectionState = "disabled";
  private stateListeners = new Set<(state: WebSocketConnectionState) => void>();

  constructor() {
    this.url = resolveWebSocketUrl();
    if (!isWebSocketEnabled()) {
      this.disabled = true;
    } else if (this.url) {
      this.connectionState = "connecting";
    }
  }

  public isEnabled() {
    return !this.disabled && Boolean(this.url);
  }

  public isConnected() {
    return this.socket?.readyState === WebSocket.OPEN && this.connectionState === "connected";
  }

  public getConnectionState() {
    return this.connectionState;
  }

  public subscribeConnectionState(listener: (state: WebSocketConnectionState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.connectionState);
    return () => this.stateListeners.delete(listener);
  }

  public connect(): WebSocket | null {
    if (this.disabled || !this.url) return null;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return this.socket;
    }

    if (this.isConnecting) {
      return this.socket;
    }

    this.isConnecting = true;
    this.setConnectionState(this.reconnectAttempts > 0 ? "reconnecting" : "connecting");

    try {
      this.socket = new WebSocket(this.url);
    } catch {
      this.isConnecting = false;
      this.handleConnectionFailure();
      return null;
    }

    this.socket.onopen = () => {
      this.isConnecting = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      const token = this.getToken();
      if (token) {
        this.setConnectionState("authenticating");
        this.socket?.send(JSON.stringify({ action: "auth", token }));
      } else {
        this.reconnectAttempts = 0;
        this.setConnectionState("connected");
        this.resubscribeAll();
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

        if (payload.event === "auth.ok") {
          this.reconnectAttempts = 0;
          this.setConnectionState("connected");
          this.resubscribeAll();
          return;
        }
        if (payload.event === "auth.error") {
          this.setConnectionState("unauthorized");
          return;
        }

        if (topic && this.listeners.has(topic)) {
          this.listeners.get(topic)?.forEach((callback) => callback(data));
        } else if (payload.event && this.listeners.has(payload.event)) {
          this.listeners.get(payload.event)?.forEach((callback) => callback(payload.data ?? payload));
        }
      } catch {
        // Ignore malformed frames.
      }
    };

    this.socket.onclose = (event) => {
      this.isConnecting = false;
      this.socket = null;
      if (event.code === 4401) {
        this.setConnectionState("unauthorized");
        return;
      }
      this.reconnectAttempts += 1;
      this.setConnectionState("reconnecting");
      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.isConnecting = false;
      this.handleConnectionFailure();
    };

    return this.socket;
  }

  private handleConnectionFailure() {
    this.reconnectAttempts += 1;
    this.setConnectionState("reconnecting");
    this.scheduleReconnect();
  }

  private getToken() {
    return typeof window === "undefined" ? null : window.localStorage.getItem("crik_token");
  }

  private setConnectionState(state: WebSocketConnectionState) {
    if (this.connectionState === state) return;
    this.connectionState = state;
    this.stateListeners.forEach((listener) => listener(state));
  }

  private disableWithWarning(reason: string) {
    if (this.warnedUnavailable) return;
    this.warnedUnavailable = true;
    this.disabled = true;
    this.setConnectionState("disabled");

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

    // Exponential backoff with jitter (max 30s)
    const base = RECONNECT_BASE_MS * Math.pow(1.5, this.reconnectAttempts - 1);
    const jitter = Math.random() * 1000;
    const delay = Math.min(base + jitter, RECONNECT_MAX_MS);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private resubscribeAll() {
    if (this.socket?.readyState !== WebSocket.OPEN || this.connectionState !== "connected") return;
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
    this.reconnectAttempts = 0;
    this.setConnectionState(this.disabled || !this.url ? "disabled" : "connecting");
  }

  public subscribe<T>(topic: string, callback: WebSocketCallback<T>): () => void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)!.add(callback as WebSocketCallback<unknown>);

    if (this.isEnabled()) {
      this.connect();
      if (this.socket?.readyState === WebSocket.OPEN && this.connectionState === "connected") {
        this.socket.send(JSON.stringify({ action: "subscribe", topic }));
      }
    }

    return () => {
      const callbacks = this.listeners.get(topic);
      if (!callbacks) return;

      callbacks.delete(callback as WebSocketCallback<unknown>);
      if (callbacks.size === 0) {
        this.listeners.delete(topic);
        if (this.socket?.readyState === WebSocket.OPEN && this.connectionState === "connected") {
          this.socket.send(JSON.stringify({ action: "unsubscribe", topic }));
        }
      }
    };
  }
}

export const socketManager = new SocketManager();
