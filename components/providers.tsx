"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

/**
 * In development the PWA service worker is disabled, but a previously-registered
 * production SW can linger in the browser and try to precache stale (404) asset
 * hashes. Unregister any SW + clear its caches in dev so things self-heal.
 * This is a no-op in production, where the SW is wanted.
 */
function useDevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) registration.unregister();
    });
    if (typeof caches !== "undefined") {
      caches.keys().then((keys) => {
        for (const key of keys) caches.delete(key);
      });
    }
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  useDevServiceWorkerCleanup();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="top-center" richColors closeButton />
    </ThemeProvider>
  );
}
