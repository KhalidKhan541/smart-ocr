interface Env {
  KV: KVNamespace;
  CORS_ORIGIN: string;
  EXPORT_SECRET: string;
}

interface ExportRequest {
  text: string;
  filename?: string;
  format?: "txt" | "json" | "csv";
}

const MIME_TYPES: Record<string, string> = {
  txt: "text/plain",
  json: "application/json",
  csv: "text/csv",
};

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, "_").slice(0, 100);
}

export const onRequestPost = async (context: { env: Env; request: Request }) => {
  const { env, request } = context;
  const origin = env.CORS_ORIGIN || "*";

  if (env.EXPORT_SECRET) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${env.EXPORT_SECRET}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }
  }

  try {
    const body = await request.json() as ExportRequest;

    if (!body.text || typeof body.text !== "string") {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const text = body.text.trim();
    const format = body.format || "txt";
    const baseName = body.filename ? sanitizeFilename(body.filename) : "ocr-export";

    let content: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "json":
        content = JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            source: "SmartOCR.ai",
            text,
          },
          null,
          2
        );
        contentType = MIME_TYPES.json;
        filename = `${baseName}.json`;
        break;

      case "csv": {
        const escaped = text.replace(/"/g, '""');
        content = `"Exported At","Source","Text"\n"${new Date().toISOString()}","SmartOCR.ai","${escaped}"`;
        contentType = MIME_TYPES.csv;
        filename = `${baseName}.csv`;
        break;
      }

      default:
        content = text;
        contentType = MIME_TYPES.txt;
        filename = `${baseName}.txt`;
        break;
    }

    const dateKey = new Date().toISOString().slice(0, 10);
    const exportKey = `export:${dateKey}:${crypto.randomUUID().slice(0, 8)}`;
    await env.KV.put(
      exportKey,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        format,
        textLength: text.length,
        filename,
      }),
      { expirationTtl: 86400 }
    );

    const counterKey = `counter:exports:${dateKey}`;
    const current = await env.KV.get(counterKey, { type: "text" });
    const newCount = (current ? parseInt(current, 10) : 0) + 1;
    await env.KV.put(counterKey, String(newCount), { expirationTtl: 172800 });

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
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
