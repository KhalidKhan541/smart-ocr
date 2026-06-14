import { useCallback, useRef } from "react";

type TrackingEvent =
  | "ocr_process"
  | "language_select"
  | "text_copy"
  | "text_download";

interface TrackOptions {
  language?: string;
  processingTimeMs?: number;
  textLength?: number;
}

const TRACK_ENDPOINT = "/api/track";
const BATCH_INTERVAL_MS = 5000;
const MAX_BATCH_SIZE = 10;

interface QueuedEvent {
  event: TrackingEvent;
  options: TrackOptions;
  timestamp: number;
}

let batchTimer: ReturnType<typeof setTimeout> | null = null;
let eventQueue: QueuedEvent[] = [];
let flushPending: Promise<void> | null = null;

async function flushQueue(): Promise<void> {
  if (eventQueue.length === 0) return;
  if (flushPending) return flushPending;

  const toSend = eventQueue.splice(0, MAX_BATCH_SIZE);
  flushPending = (async () => {
    try {
      await Promise.all(
        toSend.map((e) =>
          fetch(TRACK_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: e.event,
              language: e.options.language,
              processingTimeMs: e.options.processingTimeMs,
              textLength: e.options.textLength,
            }),
          }).catch(() => {})
        )
      );
    } finally {
      flushPending = null;
      if (eventQueue.length > 0) {
        scheduleFlush();
      }
    }
  })();

  return flushPending;
}

function scheduleFlush(): void {
  if (batchTimer) return;
  batchTimer = setTimeout(() => {
    batchTimer = null;
    flushQueue();
  }, BATCH_INTERVAL_MS);
}

export function useAnalytics() {
  const queueRef = useRef(eventQueue);

  const track = useCallback(
    (event: TrackingEvent, options: TrackOptions = {}) => {
      queueRef.current.push({
        event,
        options,
        timestamp: Date.now(),
      });

      if (queueRef.current.length >= MAX_BATCH_SIZE) {
        if (batchTimer) {
          clearTimeout(batchTimer);
          batchTimer = null;
        }
        flushQueue();
      } else {
        scheduleFlush();
      }
    },
    []
  );

  const trackOcrProcess = useCallback(
    (language: string, processingTimeMs: number, textLength: number) => {
      track("ocr_process", { language, processingTimeMs, textLength });
    },
    [track]
  );

  const trackLanguageSelect = useCallback(
    (language: string) => {
      track("language_select", { language });
    },
    [track]
  );

  const trackTextCopy = useCallback(
    (textLength: number) => {
      track("text_copy", { textLength });
    },
    [track]
  );

  const trackTextDownload = useCallback(
    (textLength: number) => {
      track("text_download", { textLength });
    },
    [track]
  );

  return {
    track,
    trackOcrProcess,
    trackLanguageSelect,
    trackTextCopy,
    trackTextDownload,
  };
}
