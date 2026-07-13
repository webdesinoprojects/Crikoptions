import { describe, expect, it } from "vitest";
import {
  flattenChatMessages,
  getChatMessagePresentation,
  selectChatOpeningRoom,
  upsertChatMessage,
  type ChatMessage,
  type ChatRoom,
} from "./chat";

const author = { id: "user-1", name: "User", tier: "STANDARD", role: "user" };

function message(id: string, clientMessageId: string, createdAt: string, optimistic = false): ChatMessage {
  return { id, clientMessageId, createdAt, optimistic, roomId: "global", author, text: id, deleted: false };
}

describe("chat cache behavior", () => {
  it("reconciles an optimistic message by clientMessageId without duplicating it", () => {
    const optimistic = message("optimistic-1", "client-1", "2026-01-01T10:00:00Z", true);
    const server = message("server-1", "client-1", "2026-01-01T10:00:01Z");
    const withOptimistic = upsertChatMessage(undefined, optimistic);
    const reconciled = upsertChatMessage(withOptimistic, server);

    expect(reconciled.pages[0].items).toEqual([server]);
  });

  it("flattens newest-first API pages into chronological display order", () => {
    const newest = message("newest", "c3", "2026-01-01T10:03:00Z");
    const middle = message("middle", "c2", "2026-01-01T10:02:00Z");
    const oldest = message("oldest", "c1", "2026-01-01T10:01:00Z");
    const data = { pages: [{ items: [newest, middle] }, { items: [oldest] }], pageParams: ["", "cursor"] };

    expect(flattenChatMessages(data).map((item) => item.id)).toEqual(["oldest", "middle", "newest"]);
  });

  it("uses the contextual match only when that room is available", () => {
    const rooms: ChatRoom[] = [
      { id: "global", kind: "global", title: "Global Chat", writable: true, unreadCount: 0 },
      { id: "match-1", kind: "match", title: "CSK vs MI", writable: true, unreadCount: 0 },
    ];

    expect(selectChatOpeningRoom(rooms, "match-1")).toBe("match-1");
    expect(selectChatOpeningRoom(rooms, "missing-match")).toBe("global");
  });

  it("places the current user's named message on the right", () => {
    const currentUserMessage = message("mine", "mine-client", "2026-01-01T10:04:00Z");
    currentUserMessage.author = { ...author, name: "Current User" };

    expect(getChatMessagePresentation(currentUserMessage, "user-1")).toEqual({
      own: true,
      authorName: "Current User",
      authorLabel: "Current User (You)",
      rowAlignmentClass: "justify-end",
      contentAlignmentClass: "items-end",
    });
  });

  it("places another user's named message on the left", () => {
    const otherUserMessage = message("theirs", "their-client", "2026-01-01T10:05:00Z");
    otherUserMessage.author = { id: "user-2", name: "Other User", tier: "STANDARD", role: "user" };

    expect(getChatMessagePresentation(otherUserMessage, "user-1")).toEqual({
      own: false,
      authorName: "Other User",
      authorLabel: "Other User",
      rowAlignmentClass: "justify-start",
      contentAlignmentClass: "items-start",
    });
  });
});
