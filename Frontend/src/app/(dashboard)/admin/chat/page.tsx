"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Flag, LoaderCircle, MessageSquareWarning, ShieldCheck, Trash2 } from "lucide-react";
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
import { chatApi, chatEnabled, chatKeys, type ChatReport } from "@/features/chat/chat";
import { getErrorMessage } from "@/lib/error-message";

export default function ChatModerationPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState<"open" | "resolved">("open");
  const [deleteTarget, setDeleteTarget] = React.useState<ChatReport | null>(null);

  const reportsQuery = useInfiniteQuery({
    queryKey: chatKeys.reports(status),
    queryFn: ({ pageParam }) => chatApi.getReports(status, pageParam),
    initialPageParam: "",
    getNextPageParam: (page) => page.nextCursor || undefined,
    enabled: chatEnabled,
  });
  const reports = reportsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, action }: { reportId: string; action: "dismiss" | "delete_message" }) =>
      chatApi.resolveReport(reportId, action),
    onSuccess: (_, variables) => {
      toast.success(variables.action === "delete_message" ? "Message removed and reports resolved" : "Report dismissed");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["chat", "reports"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Report could not be resolved")),
  });

  if (!chatEnabled) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center p-6 text-center">
        <MessageSquareWarning className="mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-bold">Chat is disabled</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enable `NEXT_PUBLIC_CHAT_ENABLED` after the backend chat service is deployed.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Admin Console
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-amber-300">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em]">Trust & Safety</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Chat Moderation</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Review community reports without exposing private account details.</p>
        </div>
        <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
          {(["open", "resolved"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-md px-4 py-2 text-xs font-black uppercase tracking-wider transition ${status === value ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {reportsQuery.isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading reports</div>
      ) : reportsQuery.isError ? (
        <div className="rounded-xl border border-red-400/15 bg-red-400/[0.05] p-8 text-center">
          <p className="text-sm font-bold text-red-200">Reports could not be loaded.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void reportsQuery.refetch()}>Retry</Button>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <CheckCircle2 className="mb-4 h-9 w-9 text-emerald-300/70" />
          <h2 className="text-base font-bold">No {status} reports</h2>
          <p className="mt-2 text-sm text-muted-foreground">{status === "open" ? "The moderation queue is clear." : "Resolved reports will appear here."}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <article key={report.id} className="rounded-xl border border-white/10 bg-[#050d18] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.18)] sm:p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-amber-200">
                      <Flag className="h-3 w-3" /> {report.reason}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">{format(new Date(report.createdAt), "MMM d, yyyy · h:mm a")}</span>
                    <span className="rounded bg-white/5 px-2 py-1 font-mono text-[8px] text-muted-foreground">Room {shortID(report.roomId)}</span>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">Message by {report.messageAuthor.name}</p>
                  <blockquote className="mt-2 whitespace-pre-wrap break-words rounded-lg border-l-2 border-primary/35 bg-white/[0.035] px-4 py-3 text-sm leading-relaxed text-slate-200">
                    {report.messageText}
                  </blockquote>
                  {report.note && (
                    <div className="mt-3 rounded-lg border border-white/8 bg-black/15 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-bold text-foreground">Reporter context:</span> {report.note}
                    </div>
                  )}
                  {report.status === "resolved" && (
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-300">Resolved: {report.resolution?.replace("_", " ")}</p>
                  )}
                </div>

                {report.status === "open" && (
                  <div className="flex shrink-0 gap-2 sm:flex-col">
                    <Button variant="outline" size="sm" onClick={() => resolveMutation.mutate({ reportId: report.id, action: "dismiss" })} disabled={resolveMutation.isPending}>
                      Dismiss
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2" onClick={() => setDeleteTarget(report)} disabled={resolveMutation.isPending}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete message
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
          {reportsQuery.hasNextPage && (
            <Button variant="outline" onClick={() => void reportsQuery.fetchNextPage()} disabled={reportsQuery.isFetchingNextPage} className="mx-auto">
              {reportsQuery.isFetchingNextPage ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null} Load more
            </Button>
          )}
        </div>
      )}

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <DialogContent className="border border-red-400/15 bg-[#10090c] text-foreground">
          <DialogHeader>
            <DialogTitle>Delete reported message?</DialogTitle>
            <DialogDescription>This replaces the message with a tombstone for every connected user and resolves all reports attached to it.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!deleteTarget || resolveMutation.isPending}
              onClick={() => deleteTarget && resolveMutation.mutate({ reportId: deleteTarget.id, action: "delete_message" })}
              className="gap-2"
            >
              {resolveMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete and resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function shortID(value: string) {
  return value === "global" ? "GLOBAL" : value.slice(-6).toUpperCase();
}
