import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/authStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export interface SocketMessage {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    email: string;
  };
  conversationId: string;
  createdAt: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private lastErrorLogTime = 0;
  private errorLogThrottle = 5000;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting && this.socket) {
      return this.socket;
    }

    this.isConnecting = true;

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
      forceNew: false,
    });

    this.socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
      this.isConnecting = false;
      this.lastErrorLogTime = 0;
    });

    this.socket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        console.log("❌ Disconnected from Socket.IO server:", reason);
      }
    });

    this.socket.on("connect_error", (error) => {
      const now = Date.now();
      if (now - this.lastErrorLogTime > this.errorLogThrottle) {
        console.error("Socket connection error:", error.message);
        console.error("Check if backend server is running on:", SOCKET_URL);
        this.lastErrorLogTime = now;
      }
      this.isConnecting = false;
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      console.log("Socket disconnected");
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("join_conversation", conversationId);
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("leave_conversation", conversationId);
    }
  }

  sendMessage(data: {
    conversationId: string;
    content: string;
    receiverId?: string;
  }): void {
    if (this.socket?.connected) {
      this.socket.emit("send_message", data);
    }
  }

  onTyping(
    callback: (data: {
      userId: string;
      username: string;
      isTyping: boolean;
    }) => void
  ): void {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  offTyping(
    callback: (data: {
      userId: string;
      username: string;
      isTyping: boolean;
    }) => void
  ): void {
    if (this.socket) {
      this.socket.off("user_typing", callback);
    }
  }

  emitTyping(conversationId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit("typing", { conversationId, isTyping });
    }
  }

  onMessage(callback: (message: SocketMessage) => void): void {
    if (this.socket) {
      this.socket.on("new_message", callback);
      this.socket.on("new_direct_message", callback);
    }
  }

  offMessage(callback: (message: SocketMessage) => void): void {
    if (this.socket) {
      this.socket.off("new_message", callback);
      this.socket.off("new_direct_message", callback);
    }
  }

  onError(callback: (error: string) => void): void {
    if (this.socket) {
      this.socket.on("error", callback);
    }
  }

  offError(callback: (error: string) => void): void {
    if (this.socket) {
      this.socket.off("error", callback);
    }
  }

  onJoinedConversation(callback: (conversationId: string) => void): void {
    if (this.socket) {
      this.socket.on("joined_conversation", callback);
    }
  }

  offJoinedConversation(callback: (conversationId: string) => void): void {
    if (this.socket) {
      this.socket.off("joined_conversation", callback);
    }
  }

  getOrCreateConversation(otherUserId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("get_or_create_conversation", otherUserId);
    }
  }

  onConversationReady(
    callback: (data: {
      conversationId: string;
      otherUser: { id: string; username: string; email: string };
    }) => void
  ): void {
    if (this.socket) {
      this.socket.on("conversation_ready", callback);
    }
  }

  offConversationReady(
    callback: (data: {
      conversationId: string;
      otherUser: { id: string; username: string; email: string };
    }) => void
  ): void {
    if (this.socket) {
      this.socket.off("conversation_ready", callback);
    }
  }
}

export const socketService = new SocketService();

export default socketService;
