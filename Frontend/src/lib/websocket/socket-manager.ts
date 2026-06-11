import { io, Socket } from "socket.io-client";

class SocketManager {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080";
  }

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        autoConnect: true,
        reconnection: true,
      });

      this.socket.on("connect", () => {
        console.log("WebSocket connected:", this.socket?.id);
      });

      this.socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });
    }
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketManager = new SocketManager();
