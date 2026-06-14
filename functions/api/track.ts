interface Env {
  KV: KVNamespace;
  CORS_ORIGIN: string;
}

interface TrackPayload {
  event: "ocr_process" | "language_select" | "text_copy" | "text_download";
  language?: string;
  processingTimeMs?: number;
  textLength?: number;
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function todayKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

export const onRequestPost = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;
  const origin = env.CORS_ORIGIN || "*";

  try {
    const body = await request.json() as TrackPayload;

    if (!body.event) {
      return new Response(JSON.stringify({ error: "Invalid event type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const dateKey = todayKey();
    const timestamp = new Date().toISOString();
    const id = `evt:${dateKey}:${crypto.randomUUID().slice(0, 8)}`;

    const eventData = {
      id,
      event: body.event,
      timestamp,
      language: body.language || "unknown",
      processingTimeMs: body.processingTimeMs || 0,
      textLength: body.textLength || 0,
      dateKey,
    };

    await env.KV.put(id, JSON.stringify(eventData), { expirationTtl: 86400 });

    const dailyKey = `daily:${dateKey}`;
    const existing = await env.KV.get(dailyKey, { type: "json" }) as Record<string, unknown> | null;
    const daily: Record<string, unknown> = existing || {
      date: dateKey,
      totalEvents: 0,
      eventsByType: {},
      languages: {},
      totalProcessingTimeMs: 0,
      totalTextLength: 0,
      eventCount: 0,
    };

    daily.totalEvents = ((daily.totalEvents as number) || 0) + 1;

    const eventsByType = (daily.eventsByType || {}) as Record<string, number>;
    eventsByType[body.event] = (eventsByType[body.event] || 0) + 1;
    daily.eventsByType = eventsByType;

    if (body.language) {
      const languages = (daily.languages || {}) as Record<string, number>;
      languages[body.language] = (languages[body.language] || 0) + 1;
      daily.languages = languages;
    }

    if (body.processingTimeMs) {
      daily.totalProcessingTimeMs =
        ((daily.totalProcessingTimeMs as number) || 0) + body.processingTimeMs;
    }

    if (body.textLength) {
      daily.totalTextLength = ((daily.totalTextLength as number) || 0) + body.textLength;
    }

    daily.eventCount = ((daily.eventCount as number) || 0) + 1;

    await env.KV.put(dailyKey, JSON.stringify(daily), { expirationTtl: 172800 });

    const counterKey = "counter:total";
    const currentCount = await env.KV.get(counterKey, { type: "text" });
    const newCount = (currentCount ? parseInt(currentCount, 10) : 0) + 1;
    await env.KV.put(counterKey, String(newCount), { expirationTtl: 172800 });

    return new Response(
      JSON.stringify({ success: true, id, dateKey }),
      { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders(origin) } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }
};

export const onRequestOptions = async (context: { env: Env }) => {
  const origin = context.env.CORS_ORIGIN || "*";
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
};
