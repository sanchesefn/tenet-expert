import { getStore } from "@netlify/blobs";

const CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const KEY = "tenet-file2.xlsx";
// simple upload gate (not a high-value secret; feed is semi-public anyway)
const UPLOAD_TOKEN = "tenet-feed2-20260916";

export default async (req: Request) => {
  const store = getStore({ name: "avito-feeds", consistency: "strong" });
  if (req.method === "GET" || req.method === "HEAD") {
    const data = await store.get(KEY, { type: "arrayBuffer" });
    if (!data) {
      return new Response("feed not uploaded yet", { status: 404 });
    }
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": CT,
        "Content-Disposition": 'attachment; filename="tenet-file2.xlsx"',
        "Cache-Control": "no-cache",
      },
    });
  }
  if (req.method === "PUT" || req.method === "POST") {
    const tok = req.headers.get("x-upload-token") || "";
    if (tok !== UPLOAD_TOKEN) {
      return new Response("unauthorized", { status: 401 });
    }
    const buf = await req.arrayBuffer();
    if (!buf || buf.byteLength < 1000) {
      return new Response("empty body", { status: 400 });
    }
    await store.set(KEY, buf, { metadata: { updated: new Date().toISOString(), bytes: String(buf.byteLength) } });
    return new Response(JSON.stringify({ ok: true, bytes: buf.byteLength }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response("method", { status: 405 });
};

export const config = {
  path: "/feeds/tenet-file2.xlsx",
};
