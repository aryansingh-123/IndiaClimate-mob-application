import { useEffect, useState } from "react";

// Re-renders on an interval so time-based text (header clock) stays current.
export function useNow(intervalMs = 60 * 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
