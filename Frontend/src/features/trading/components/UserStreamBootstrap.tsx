"use client";

import { useUserStream } from "@/features/trading/hooks";

export function UserStreamBootstrap() {
  useUserStream();
  return null;
}
