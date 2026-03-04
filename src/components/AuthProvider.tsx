"use client";

import { useEffect } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Dynamically import to avoid SSR initialization of Firebase client SDK
    import("@/lib/firebase").then(({ onTokenRefresh }) => {
      const unsubscribe = onTokenRefresh(() => {
        // Token refresh syncs session cookie automatically
      });

      return () => unsubscribe();
    });
  }, []);

  return <>{children}</>;
}
