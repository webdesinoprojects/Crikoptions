"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { v4 as uuidv4 } from "uuid";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  ChevronDown,
  Flag,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Radio,
  RefreshCw,
  Send,
  Share2,
  Trash2,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { useMatchDetails } from "@/features/dashboard/hooks";
import { useMarketDetail } from "@/features/trading/hooks";
import { getErrorMessage } from "@/lib/error-message";
import { socketManager, type WebSocketConnectionState } from "@/lib/websocket/socket-manager";
import {
  chatApi,
  chatEnabled,
  chatKeys,
  chatStream,
  flattenChatMessages,
  getChatMessagePresentation,
  selectChatOpeningRoom,
  upsertChatMessage,
  type ChatMessage,
  type ChatMessagePage,
  type ChatRealtimeEvent,
  type ChatReportReason,
  type ChatRoom,
} from "./chat";

const FIRST_ITEM_INDEX = 100_000;

export function GlobalChat() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const virtuosoRef = React.useRef<VirtuosoHandle>(null);
  const [open, setOpen] = React.useState(false);
  const [selectedRoomId, setSelectedRoomId] = React.useState("global");
  const [draft, setDraft] = React.useState("");
  const [atBottom, setAtBottom] = React.useState(true);
  const [newMessageCount, setNewMessageCount] = React.useState(0);
  const [reportTarget, setReportTarget] = React.useState<ChatMessage | null>(null);
  const [reportReason, setReportReason] = React.useState<ChatReportReason>("spam");
  const [reportNote, setReportNote] = React.useState("");
  const [shareUrl, setShareUrl] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.origin);
    }
  }, []);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Hey! Join me on CricOptions, the live cricket options trading platform! 🏏📈\n\nTrade live and practice matches with me here: ${shareUrl || "https://cricoptions.com"}`
  )}`;

  const tradingMarketId = pathname.match(/^\/trading\/([^/]+)/)?.[1] ?? "";
  const adminMatchId = pathname.match(/^\/admin\/matches\/([^/]+)/)?.[1] ?? "";
  const marketQuery = useMarketDetail(tradingMarketId);
  const rawContextMatchId = adminMatchId || marketQuery.data?.matchId || "";
  const contextMatchQuery = useMatchDetails(rawContextMatchId);
  const contextualRoomId = contextMatchQuery.data?.id || adminMatchId || "";

  const roomsQuery = useQuery({
    queryKey: chatKeys.rooms,
    queryFn: chatApi.getRooms,
    enabled: chatEnabled && isAuthenticated,
    staleTime: 15_000,
    retry: false,
  });
  const rooms = React.useMemo(() => roomsQuery.data?.items ?? [], [roomsQuery.data]);
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];
  const unreadCount = rooms.reduce((total, room) => total + room.unreadCount, 0);

  const messagesQuery = useInfiniteQuery({
    queryKey: chatKeys.messages(selectedRoomId),
    queryFn: ({ pageParam }) => chatApi.getMessages(selectedRoomId, pageParam),
    initialPageParam: "",
    getNextPageParam: (page) => page.nextCursor || undefined,
    enabled: chatEnabled && isAuthenticated && open && Boolean(selectedRoomId),
    staleTime: 10_000,
    retry: false,
  });
  const messages = React.useMemo(
    () => flattenChatMessages(messagesQuery.data),
    [messagesQuery.data]
  );

  const connectionState = React.useSyncExternalStore(
    React.useCallback((listener) => socketManager.subscribeConnectionState(listener), []),
    React.useCallback(() => socketManager.getConnectionState(), []),
    () => "disabled" as WebSocketConnectionState
  );

  const upsertRealtimeMessage = React.useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(chatKeys.messages(message.roomId), (current) =>
        upsertChatMessage(current, message)
      );
    },
    [queryClient]
  );

  React.useEffect(() => {
    if (!chatEnabled || !isAuthenticated || rooms.length === 0) return;
    const unsubscribers = rooms.map((room) =>
      chatStream.subscribe(room.id, (event: ChatRealtimeEvent) => {
        upsertRealtimeMessage(event.message);
        void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
        if (open && selectedRoomId === event.message.roomId && !atBottom && event.type === "message.created" && event.message.author.id !== user?.id) {
          setNewMessageCount((count) => count + 1);
        }
      })
    );
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [atBottom, isAuthenticated, open, queryClient, rooms, selectedRoomId, upsertRealtimeMessage, user?.id]);

  React.useEffect(() => {
    if (connectionState !== "connected") return;
    void queryClient.invalidateQueries({ queryKey: chatKeys.rooms });
    if (open) void queryClient.invalidateQueries({ queryKey: chatKeys.messages(selectedRoomId) });
  }, [connectionState, open, queryClient, selectedRoomId]);

  React.useEffect(() => {
    if (!open || !selectedRoomId) return;
    const latest = messagesQuery.data?.pages[0]?.items[0];
    if (!latest) return;
    const timer = window.setTimeout(() => {
      void chatApi.markRead(selectedRoomId, latest.id).then(() => {
        queryClient.setQueryData<{ items: ChatRoom[] }>(chatKeys.rooms, (current) =>
          current ? { items: current.items.map((room) => room.id === selectedRoomId ? { ...room, unreadCount: 0 } : room) } : current
        );
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [messagesQuery.data, open, queryClient, selectedRoomId]);

  const sendMutation = useMutation({
    mutationFn: ({ roomId, clientMessageId, text }: { roomId: string; clientMessageId: string; text: string }) =>
      chatApi.sendMessage(roomId, clientMessageId, text),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.messages(variables.roomId) });
      const previous = queryClient.getQueryData<InfiniteData<ChatMessagePage>>(chatKeys.messages(variables.roomId));
      const optimistic: ChatMessage = {
        id: `optimistic-${variables.clientMessageId}`,
        roomId: variables.roomId,
        author: { id: user?.id ?? "", name: user?.name ?? "You", tier: user?.tier ?? "STANDARD", role: user?.role ?? "user" },
        text: variables.text,
        clientMessageId: variables.clientMessageId,
        createdAt: new Date().toISOString(),
        deleted: false,
        optimistic: true,
      };
      queryClient.setQueryData<InfiniteData<ChatMessagePage>>(chatKeys.messages(variables.roomId), (current) => upsertChatMessage(current, optimistic));
      return { previous };
    },
    onSuccess: (message) => {
      upsertRealtimeMessage(message);
      window.setTimeout(() => virtuosoRef.current?.scrollToIndex({ index: messages.length, align: "end", behavior: "smooth" }), 0);
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(chatKeys.messages(variables.roomId), context?.previous);
      setDraft((current) => current || variables.text);
      toast.error(getErrorMessage(error, "Message could not be sent"));
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: chatKeys.rooms }),
  });

  const deleteMutation = useMutation({
    mutationFn: chatApi.deleteMessage,
    onSuccess: (message) => {
      upsertRealtimeMessage(message);
      toast.success("Message deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Message could not be deleted")),
  });

  const reportMutation = useMutation({
    mutationFn: () => reportTarget ? chatApi.reportMessage(reportTarget.id, reportReason, reportNote) : Promise.reject(new Error("No message selected")),
    onSuccess: () => {
      toast.success("Report submitted for review");
      setReportTarget(null);
      setReportNote("");
      setReportReason("spam");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Report could not be submitted")),
  });

  if (!chatEnabled || !isAuthenticated || !user) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const desired = selectChatOpeningRoom(rooms, contextualRoomId);
      setSelectedRoomId(desired);
      setNewMessageCount(0);
    }
    setOpen(nextOpen);
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !selectedRoom?.writable || sendMutation.isPending) return;
    setDraft("");
    sendMutation.mutate({ roomId: selectedRoom.id, clientMessageId: uuidv4(), text });
  };

  const jumpToLatest = () => {
    virtuosoRef.current?.scrollToIndex({ index: Math.max(messages.length - 1, 0), align: "end", behavior: "smooth" });
    setNewMessageCount(0);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label={unreadCount ? `Open chat, ${unreadCount} unread messages` : "Open chat"}
            title="Community chat"
            className="relative flex flex-col items-center gap-0.5 text-muted-foreground transition hover:text-primary focus-visible:outline-none"
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.035] transition-all hover:border-primary/30 hover:bg-primary/10">
              <MessageCircle className="h-4 w-4" aria-hidden />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full border border-background bg-primary px-1 text-center font-mono text-[8px] font-black leading-[14px] text-black shadow-[0_0_12px_rgba(14,165,233,0.55)]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider">Chat</span>
          </button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="flex h-[100dvh] w-full max-w-none flex-col gap-0 overflow-hidden border-l border-white/10 bg-[#010711] p-0 text-foreground shadow-[-28px_0_80px_rgba(0,0,0,0.55)] sm:w-[420px] sm:max-w-[420px]"
        >
          <SheetHeader className="shrink-0 space-y-0 border-b border-white/10 bg-[#04101e]/95 px-4 pb-3 pt-4 pr-12 text-left backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  Community Desk
                </SheetTitle>
                <SheetDescription className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Global and live match conversations
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Invite friends via WhatsApp"
                  className="flex items-center gap-1.5 rounded-full border border-[#25d366]/20 bg-[#25d366]/10 px-2 py-1 font-mono text-[8px] font-black uppercase tracking-wider text-[#25d366] hover:bg-[#25d366]/20 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#25d366]"
                >
                  <Share2 className="h-2.5 w-2.5" />
                  Invite
                </a>
                <ConnectionBadge state={connectionState} />
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedRoomId}
                onChange={(event) => {
                  setSelectedRoomId(event.target.value);
                  setNewMessageCount(0);
                  setAtBottom(true);
                }}
                aria-label="Select chat room"
                className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-[#071628] px-3 pr-9 text-xs font-bold text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              >
                <optgroup label="Community">
                  {rooms.filter((room) => room.kind === "global").map((room) => <RoomOption key={room.id} room={room} />)}
                </optgroup>
                <optgroup label="Matches">
                  {rooms.filter((room) => room.kind === "match" && room.writable).map((room) => <RoomOption key={room.id} room={room} />)}
                </optgroup>
                {rooms.some((room) => room.kind === "match" && !room.writable) && (
                  <optgroup label="Archived">
                    {rooms.filter((room) => room.kind === "match" && !room.writable).map((room) => <RoomOption key={room.id} room={room} />)}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </SheetHeader>

          <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.07),transparent_42%)]">
            {messagesQuery.isLoading ? (
              <MessageSkeleton />
            ) : messagesQuery.isError ? (
              <ChatError onRetry={() => void messagesQuery.refetch()} />
            ) : messages.length === 0 ? (
              <EmptyRoom archived={selectedRoom ? !selectedRoom.writable : false} />
            ) : (
              <Virtuoso
                key={selectedRoomId}
                ref={virtuosoRef}
                className="h-full"
                data={messages}
                firstItemIndex={FIRST_ITEM_INDEX - messages.length}
                initialTopMostItemIndex={messages.length - 1}
                followOutput={(isAtListBottom) => isAtListBottom ? "smooth" : false}
                atBottomStateChange={(value) => {
                  setAtBottom(value);
                  if (value) setNewMessageCount(0);
                }}
                startReached={() => {
                  if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) void messagesQuery.fetchNextPage();
                }}
                components={{
                  Header: () => messagesQuery.isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Loading earlier messages
                    </div>
                  ) : <div className="h-3" />,
                  Footer: () => <div className="h-3" />,
                }}
                itemContent={(index, message) => (
                  <MessageRow
                    message={message}
                    previous={messages[index - 1]}
                    currentUserId={user.id}
                    isAdmin={user.role === "admin"}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onReport={(target) => setReportTarget(target)}
                  />
                )}
              />
            )}

            {newMessageCount > 0 && (
              <button
                type="button"
                onClick={jumpToLatest}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-primary/25 bg-[#06203a]/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary shadow-xl backdrop-blur transition hover:bg-primary/15"
              >
                {newMessageCount} new {newMessageCount === 1 ? "message" : "messages"}
              </button>
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#030b16]/98 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            {selectedRoom && !selectedRoom.writable ? (
              <div className="flex min-h-14 items-center gap-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.06] px-3 text-amber-200/80">
                <Archive className="h-4 w-4 shrink-0" />
                <p className="text-[11px] leading-relaxed">This match has ended. The conversation is preserved as read-only.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#071423] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-within:border-primary/35 focus-within:ring-2 focus-within:ring-primary/10">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  maxLength={1000}
                  rows={2}
                  aria-label={`Message ${selectedRoom?.title ?? "chat"}`}
                  placeholder={`Message ${selectedRoom?.title ?? "the room"}`}
                  className="max-h-28 min-h-12 w-full resize-none bg-transparent px-1 py-1 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/55"
                />
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className={`font-mono text-[9px] ${draft.length > 850 ? "text-amber-300" : "text-muted-foreground/55"}`}>
                    {draft.length}/1000
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSend}
                    disabled={!draft.trim() || sendMutation.isPending}
                    className="h-8 gap-2 bg-primary px-3 text-xs font-black text-black shadow-[0_0_18px_rgba(14,165,233,0.22)]"
                  >
                    {sendMutation.isPending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(reportTarget)} onOpenChange={(next) => !next && setReportTarget(null)}>
        <DialogContent className="border border-white/10 bg-[#07111f] text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Flag className="h-4 w-4 text-amber-300" /> Report message</DialogTitle>
            <DialogDescription>Reports are reviewed by CricOptions administrators. The sender is not notified.</DialogDescription>
          </DialogHeader>
          <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
            Reason
            <select
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value as ChatReportReason)}
              className="h-10 rounded-lg border border-white/10 bg-[#030b16] px-3 text-sm text-foreground outline-none focus:border-primary/40"
            >
              <option value="spam">Spam</option>
              <option value="abuse">Abuse</option>
              <option value="harassment">Harassment</option>
              <option value="misinformation">Misinformation</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-bold text-muted-foreground">
            Additional context <span className="font-normal">(optional)</span>
            <textarea
              value={reportNote}
              onChange={(event) => setReportNote(event.target.value)}
              maxLength={250}
              rows={3}
              className="resize-none rounded-lg border border-white/10 bg-[#030b16] p-3 text-sm text-foreground outline-none focus:border-primary/40"
            />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportTarget(null)}>Cancel</Button>
            <Button onClick={() => reportMutation.mutate()} disabled={reportMutation.isPending} className="gap-2">
              {reportMutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />} Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RoomOption({ room }: { room: ChatRoom }) {
  const status = room.kind === "match" ? ` · ${room.matchStatus ?? "match"}` : "";
  const unread = room.unreadCount ? ` (${room.unreadCount > 99 ? "99+" : room.unreadCount})` : "";
  return <option value={room.id}>{room.title}{status}{unread}</option>;
}

function ConnectionBadge({ state }: { state: WebSocketConnectionState }) {
  const connected = state === "connected";
  const reconnecting = state === "reconnecting" || state === "connecting" || state === "authenticating";
  return (
    <div className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[8px] font-black uppercase tracking-wider ${
      connected ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : reconnecting ? "border-amber-300/20 bg-amber-300/10 text-amber-200" : "border-red-400/20 bg-red-400/10 text-red-300"
    }`}>
      {connected ? <Radio className="h-2.5 w-2.5" /> : reconnecting ? <RefreshCw className="h-2.5 w-2.5 animate-spin" /> : <WifiOff className="h-2.5 w-2.5" />}
      {connected ? "Live" : reconnecting ? "Syncing" : "Offline"}
    </div>
  );
}

function MessageRow({
  message,
  previous,
  currentUserId,
  isAdmin,
  onDelete,
  onReport,
}: {
  message: ChatMessage;
  previous?: ChatMessage;
  currentUserId: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onReport: (message: ChatMessage) => void;
}) {
  const {
    own,
    authorName,
    authorLabel,
    rowAlignmentClass,
    contentAlignmentClass,
  } = getChatMessagePresentation(message, currentUserId);
  const grouped = previous?.author.id === message.author.id && new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() < 5 * 60_000;
  const showDate = !previous || !isSameDay(new Date(previous.createdAt), new Date(message.createdAt));
  const canDelete = !message.deleted && (own || isAdmin) && !message.optimistic;
  const canReport = !message.deleted && !own && !message.optimistic;

  return (
    <div className="px-3">
      {showDate && (
        <div className="my-4 flex items-center gap-3" aria-label={format(new Date(message.createdAt), "MMMM d, yyyy")}>
          <div className="h-px flex-1 bg-white/8" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{format(new Date(message.createdAt), "MMM d")}</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>
      )}
      <div
        className={`group flex gap-2 ${grouped ? "mt-1" : "mt-3"} ${rowAlignmentClass}`}
        aria-label={`Message from ${authorName}`}
      >
        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black ${grouped ? "invisible" : ""} ${own ? "order-2 border-primary/25 bg-primary/15 text-primary" : "border-white/10 bg-white/[0.055] text-slate-300"}`}>
          {authorName.charAt(0).toUpperCase()}
        </div>
        <div className={`flex min-w-0 max-w-[78%] flex-col ${contentAlignmentClass} ${own ? "order-1" : ""}`}>
          <div className={`mb-1 flex max-w-full items-center gap-2 px-1 ${own ? "justify-end" : "justify-start"}`}>
            <span className="truncate text-[10px] font-black text-foreground">{authorLabel}</span>
            {message.author.role === "admin" && <span className="rounded bg-amber-300/10 px-1 py-0.5 text-[7px] font-black uppercase tracking-wider text-amber-200">Admin</span>}
            <time className="shrink-0 font-mono text-[8px] text-muted-foreground">{format(new Date(message.createdAt), "h:mm a")}</time>
          </div>
          <div className={`flex items-start gap-1 ${own ? "flex-row-reverse" : ""}`}>
            <div className={`rounded-2xl border px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
              own ? "rounded-tr-md border-primary/20 bg-primary/12 text-sky-50" : "rounded-tl-md border-white/8 bg-[#0a1727] text-slate-200"
            } ${message.optimistic ? "opacity-60" : ""}`}>
              {message.deleted ? (
                <span className="flex items-center gap-2 text-xs italic text-muted-foreground"><Trash2 className="h-3 w-3" /> Message deleted</span>
              ) : (
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
              )}
            </div>
            {(canDelete || canReport) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label="Message actions" className="mt-1 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-100 transition hover:bg-white/5 hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={own ? "end" : "start"} className="border-white/10 bg-[#081321] text-foreground">
                  {canReport && <DropdownMenuItem onClick={() => onReport(message)} className="cursor-pointer gap-2 text-xs"><Flag className="h-3.5 w-3.5" /> Report</DropdownMenuItem>}
                  {canDelete && <DropdownMenuItem onClick={() => onDelete(message.id)} className="cursor-pointer gap-2 text-xs text-red-300 focus:text-red-200"><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex h-full flex-col justify-end gap-4 p-4">
      {["w-3/5", "w-4/5 self-end", "w-2/3", "w-1/2 self-end"].map((width, index) => (
        <div key={index} className={`${width} h-14 animate-pulse rounded-2xl border border-white/5 bg-white/[0.035]`} />
      ))}
    </div>
  );
}

function EmptyRoom({ archived }: { archived: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/[0.07] text-primary">
        {archived ? <Archive className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </div>
      <h3 className="text-sm font-black">{archived ? "No archived messages" : "Start the conversation"}</h3>
      <p className="mt-2 max-w-64 text-xs leading-relaxed text-muted-foreground">
        {archived ? "This match room closed without any messages." : "Share match observations and market context with the CricOptions community."}
      </p>
    </div>
  );
}

function ChatError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <AlertTriangle className="mb-3 h-6 w-6 text-amber-300" />
      <p className="text-sm font-bold">Messages could not be loaded</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 gap-2"><RefreshCw className="h-3.5 w-3.5" /> Retry</Button>
    </div>
  );
}
