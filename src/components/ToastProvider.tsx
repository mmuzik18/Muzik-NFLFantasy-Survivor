"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";

type ToastKind = "success" | "error";
type Toast = { id: number; kind: ToastKind; message: string };

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId.current++;
      setToasts((cur) => [...cur, { id, kind, message }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  const value: ToastContextValue = {
    success: (message) => push("success", message),
    error: (message) => push("error", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="no-print fixed top-16 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:right-4 sm:left-auto sm:translate-x-0"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast-in flex items-start justify-between gap-3 rounded-md border px-3.5 py-2.5 text-sm shadow-float ${
              t.kind === "success"
                ? "border-win/30 bg-win-soft text-win"
                : "border-loss/30 bg-loss-soft text-loss"
            }`}
          >
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="mt-0.5 shrink-0 cursor-pointer opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
