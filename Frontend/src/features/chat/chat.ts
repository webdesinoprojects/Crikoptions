import { apiClient } from "@/lib/api/client";
import { socketManager } from "@/lib/websocket/socket-manager";
import type { InfiniteData } from "@tanstack/react-query";

export type ChatRoomKind = "global" | "match";
export type ChatReportReason = "spam" | "abuse" | "harassment" | "misinformation" | "other";

export interface ChatAuthor {
  id: string;
  name: string;
  tier: string;
  role: string;
}

export interface ChatRoom {
  id: string;
  kind: ChatRoomKind;
  title: string;
  matchStatus?: string;
  writable: boolean;
  unreadCount: number;
  latestMessageAt?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  author: ChatAuthor;
  text: string;
  clientMessageId: string;
  createdAt: string;
  deleted: boolean;
  deletedAt?: string;
  optimistic?: boolean;
  failed?: boolean;
}

export interface ChatMessagePage {
  items: ChatMessage[];
  nextCursor?: string;
}

export interface ChatReport {
  id: string;
  messageId: string;
  roomId: string;
  messageText: string;
  messageAuthor: ChatAuthor;
  reporterId: string;
  reason: ChatReportReason;
  note?: string;
  status: "open" | "resolved";
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface ChatReportPage {
  items: ChatReport[];
  nextCursor?: string;
}

export interface ChatRealtimeEvent {
  type: "message.created" | "message.deleted";
  message: ChatMessage;
}

export interface ChatMessagePresentation {
  own: boolean;
  authorName: string;
  authorLabel: string;
  rowAlignmentClass: "justify-end" | "justify-start";
  contentAlignmentClass: "items-end" | "items-start";
}

interface Envelope<T> {
  success: boolean;
  data: T;
}

export const chatEnabled = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";
export const chatKeys = {
  rooms: ["chat", "rooms"] as const,
  messages: (roomId: string) => ["chat", "messages", roomId] as const,
  reports: (status: string) => ["chat", "reports", status] as const,
};

export const chatApi = {
  async getRooms(): Promise<{ items: ChatRoom[] }> {
    const response = await apiClient.get<Envelope<{ items: ChatRoom[] }>>("/v1/chat/rooms");
    return response.data.data;
  },

  async getMessages(roomId: string, cursor = ""): Promise<ChatMessagePage> {
    const response = await apiClient.get<Envelope<ChatMessagePage>>(
      `/v1/chat/rooms/${encodeURIComponent(roomId)}/messages`,
      { params: { ...(cursor ? { cursor } : {}), limit: 50 } }
    );
    return response.data.data;
  },

  async sendMessage(roomId: string, clientMessageId: string, text: string): Promise<ChatMessage> {
    const response = await apiClient.post<Envelope<ChatMessage>>(
      `/v1/chat/rooms/${encodeURIComponent(roomId)}/messages`,
      { clientMessageId, text }
    );
    return response.data.data;
  },

  async markRead(roomId: string, lastReadMessageId: string): Promise<void> {
    await apiClient.post(`/v1/chat/rooms/${encodeURIComponent(roomId)}/read`, { lastReadMessageId });
  },

  async deleteMessage(messageId: string): Promise<ChatMessage> {
    const response = await apiClient.delete<Envelope<ChatMessage>>(`/v1/chat/messages/${messageId}`);
    return response.data.data;
  },

  async reportMessage(messageId: string, reason: ChatReportReason, note: string): Promise<ChatReport> {
    const response = await apiClient.post<Envelope<ChatReport>>(`/v1/chat/messages/${messageId}/reports`, {
      reason,
      note,
    });
    return response.data.data;
  },

  async getReports(status: "open" | "resolved", cursor = ""): Promise<ChatReportPage> {
    const response = await apiClient.get<Envelope<ChatReportPage>>("/v1/admin/chat/reports", {
      params: { status, ...(cursor ? { cursor } : {}), limit: 50 },
    });
    return response.data.data;
  },

  async resolveReport(reportId: string, action: "dismiss" | "delete_message"): Promise<ChatReport> {
    const response = await apiClient.patch<Envelope<ChatReport>>(`/v1/admin/chat/reports/${reportId}`, { action });
    return response.data.data;
  },
};

export const chatStream = {
  subscribe(roomId: string, onEvent: (event: ChatRealtimeEvent) => void): () => void {
    return socketManager.subscribe(`chat:room:${roomId}`, onEvent);
  },
};

export function upsertChatMessage(
  current: InfiniteData<ChatMessagePage> | undefined,
  message: ChatMessage
): InfiniteData<ChatMessagePage> {
  const base = current ?? { pages: [{ items: [], nextCursor: undefined }], pageParams: [""] };
  let found = false;
  const pages = base.pages.map((page) => ({
    ...page,
    items: page.items.map((item) => {
      if (item.id === message.id || item.clientMessageId === message.clientMessageId) {
        found = true;
        return message;
      }
      return item;
    }),
  }));
  if (!found) pages[0] = { ...pages[0], items: [message, ...pages[0].items] };
  return { ...base, pages };
}

export function flattenChatMessages(data?: InfiniteData<ChatMessagePage>): ChatMessage[] {
  return (data?.pages.flatMap((page) => page.items) ?? []).reverse();
}

export function selectChatOpeningRoom(rooms: ChatRoom[], contextualRoomId: string): string {
  return rooms.some((room) => room.id === contextualRoomId) ? contextualRoomId : "global";
}

export function getChatMessagePresentation(
  message: ChatMessage,
  currentUserId: string
): ChatMessagePresentation {
  const own = Boolean(currentUserId) && message.author.id === currentUserId;
  const authorName = message.author.name.trim() || "Unknown user";

  return {
    own,
    authorName,
    authorLabel: own ? `${authorName} (You)` : authorName,
    rowAlignmentClass: own ? "justify-end" : "justify-start",
    contentAlignmentClass: own ? "items-end" : "items-start",
  };
}
