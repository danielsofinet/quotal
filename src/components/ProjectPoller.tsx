"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { authFetch } from "@/lib/api";

interface ProjectPollerProps {
  projectId: string;
  currentQuoteCount: number;
}

export default function ProjectPoller({ projectId, currentQuoteCount }: ProjectPollerProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const countRef = useRef(currentQuoteCount);

  useEffect(() => {
    countRef.current = currentQuoteCount;
  }, [currentQuoteCount]);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await authFetch(`/api/projects/${projectId}/quote-count`);
        if (!res.ok) return;
        const { count } = await res.json();
        if (count > countRef.current) {
          startTransition(() => {
            router.refresh();
          });
        }
      } catch {}
    };

    const interval = setInterval(poll, 10_000);
    return () => clearInterval(interval);
  }, [projectId, router]);

  return null;
}
