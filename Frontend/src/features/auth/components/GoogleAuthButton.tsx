"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdApi {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } };
  }
}

interface GoogleAuthButtonProps {
  /** Called with the Google ID token ("credential") after a successful prompt. */
  onCredential: (credential: string) => void;
  /** Rendered button text — "signup_with" or "signin_with". */
  text?: "signup_with" | "signin_with" | "continue_with";
  disabled?: boolean;
}

// Loads the Google Identity Services script once and resolves when ready.
let gsiPromise: Promise<void> | null = null;
function loadGsi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")));
      return;
    }
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
  return gsiPromise;
}

/**
 * Renders Google's official "Sign in with Google" button. Returns null when no
 * client ID is configured so the rest of the auth form still works.
 */
export function GoogleAuthButton({ onCredential, text = "continue_with", disabled }: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: GoogleCredentialResponse) => {
            if (response.credential) callbackRef.current(response.credential);
          },
        });

        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          text,
          shape: "rectangular",
          logo_alignment: "left",
          width: containerRef.current.clientWidth || 320,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!GOOGLE_CLIENT_ID || failed) return null;

  return (
    <div
      ref={containerRef}
      className={disabled ? "pointer-events-none opacity-60" : undefined}
      aria-label="Sign in with Google"
    />
  );
}
