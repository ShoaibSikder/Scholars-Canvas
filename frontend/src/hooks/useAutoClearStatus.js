import { useEffect } from "react";

export default function useAutoClearStatus(status, setStatus, { duration = 3500 } = {}) {
  useEffect(() => {
    if (!status) return;

    const timeoutId = window.setTimeout(() => {
      setStatus("");
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, setStatus, status]);
}

