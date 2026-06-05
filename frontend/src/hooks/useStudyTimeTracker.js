import { useEffect } from "react";

import { createStudySession } from "../api";

export default function useStudyTimeTracker(isAuthenticated) {
  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const tracker = {
      activeSeconds: 0,
      lastTick: Date.now(),
      lastActivity: Date.now(),
      flushing: false,
    };

    const markActive = () => {
      tracker.lastActivity = Date.now();
    };

    const flushOnlineStudyTime = async () => {
      if (tracker.flushing) return;

      const minutes = Math.floor(tracker.activeSeconds / 60);
      if (minutes <= 0) return;

      tracker.flushing = true;
      const endedAtDate = new Date();
      const startedAt = new Date(endedAtDate.getTime() - minutes * 60 * 1000).toISOString();
      const endedAt = endedAtDate.toISOString();
      tracker.activeSeconds -= minutes * 60;

      try {
        await createStudySession({
          title: "Website study time",
          course: "Online Activity",
          started_at: startedAt,
          ended_at: endedAt,
          duration_minutes: minutes,
          notes: "Automatically tracked from active time spent on StudentAssistant.",
        });
      } catch {
        tracker.activeSeconds += minutes * 60;
      } finally {
        tracker.flushing = false;
      }
    };

    const activityEvents = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, markActive, { passive: true }),
    );

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.min(15, Math.max(0, (now - tracker.lastTick) / 1000));
      tracker.lastTick = now;

      const recentlyActive = now - tracker.lastActivity < 5 * 60 * 1000;
      if (document.visibilityState === "visible" && recentlyActive) {
        tracker.activeSeconds += elapsedSeconds;
      }

      if (tracker.activeSeconds >= 60) {
        flushOnlineStudyTime();
      }
    }, 10000);

    const handleVisibilityChange = () => {
      tracker.lastTick = Date.now();
      if (document.visibilityState === "hidden") {
        flushOnlineStudyTime();
      } else {
        markActive();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, markActive),
      );
      flushOnlineStudyTime();
    };
  }, [isAuthenticated]);
}

