"use client";

import { useSearchParams } from "next/navigation";
import type { Mode } from "./data";

export function useMode(): Mode {
  return useSearchParams().get("mode") === "full" ? "full" : "no-change";
}

/** Builds internal links that carry the current ?mode along. */
export function useHref() {
  const mode = useMode();
  return (path: string, params: Record<string, string> = {}) => {
    const search = new URLSearchParams(params);
    if (mode === "full") search.set("mode", "full");
    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
  };
}
