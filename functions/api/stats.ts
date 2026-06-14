interface Env {
  KV: KVNamespace;
  CORS_ORIGIN: string;
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function todayKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

export const onRequestGet = async (context: { env: Env }) => {
  const { env } = context;
  const origin = env.CORS_ORIGIN || "*";

  try {
    const dateKey = todayKey();
    const dailyKey = `daily:${dateKey}`;
    const daily = await env.KV.get(dailyKey, { type: "json" }) as Record<string, unknown> | null;

    const totalKey = "counter:total";
    const totalCount = await env.KV.get(totalKey, { type: "text" });

    let todayCount = 0;
    let ocrCount = 0;
    let avgProcessingTimeMs = 0;
    let avgTextLength = 0;
    let languages: Record<string, number> = {};

    if (daily) {
      todayCount = (daily.eventCount as number) || 0;
      const eventsByType = (daily.eventsByType || {}) as Record<string, number>;
      ocrCount = eventsByType.ocr_process || 0;
      languages = (daily.languages || {}) as Record<string, number>;

      if (eventsByType.ocr_process) {
        avgProcessingTimeMs = Math.round(
          ((daily.totalProcessingTimeMs as number) || 0) / eventsByType.ocr_process
        );
        avgTextLength = Math.round(
          ((daily.totalTextLength as number) || 0) / eventsByType.ocr_process
        );
      }
    }

    const popularLanguages = Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, count }));

    const stats = {
      today: {
        date: dateKey,
        totalEvents: todayCount,
        extractions: ocrCount,
        avgProcessingTimeMs,
        avgTextLength,
        popularLanguages,
      },
      allTime: {
        totalExtractions: parseInt(totalCount || "0", 10),
      },
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
        ...corsHeaders(origin),
      },
    });
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
