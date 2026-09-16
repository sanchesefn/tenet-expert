import { getStore } from "@netlify/blobs";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

function recKey(x: any) {
  if (!x || !x.surname) return "";
  if (x.type === "login") return "login|" + String(x.surname).toLowerCase();
  if (x.type === "pass") return "pass|" + String(x.surname).toLowerCase() + "|" + (x.model || "") + "|" + String(x.code || "").toUpperCase();
  if (x.type === "pin_request") return "pin|" + (x.kind || "login") + "|" + String(x.surname).toLowerCase();
  return "exam|" + String(x.surname).toLowerCase() + "|" + (x.model || "") + "|" + String(Number(x.exam || 1));
}

function betterExam(a: any, b: any) {
  if (!a) return b;
  if (!b) return a;
  if (a.type || b.type) return Object.assign({}, a, b);
  const ap = Number(a.percent || 0);
  const bp = Number(b.percent || 0);
  let win = b;
  let lose = a;
  if (ap > bp) {
    win = a;
    lose = b;
  } else if (ap === bp) {
    win = String(b.at || "") >= String(a.at || "") ? b : a;
    lose = win === b ? a : b;
  }
  const out = Object.assign({}, lose, win);
  if (a.status !== "running" || b.status !== "running") out.status = "done";
  if (a.tgSent || b.tgSent) out.tgSent = true;
  if (out.status === "done") delete out.run;
  return out;
}

function mergeCloud(base: any[], extra: any[]) {
  const map = new Map<string, any>();
  (base || []).concat(extra || []).forEach((x) => {
    if (!x) return;
    const k = recKey(x);
    if (!k) return;
    const prev = map.get(k);
    map.set(k, prev ? betterExam(prev, x) : x);
  });
  return Array.from(map.values());
}

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers: CORS });
  }
  try {
    const store = getStore({ name: "tenet-rating", consistency: "strong" });
    const raw = await store.get("locks", { type: "json" });
    const list = Array.isArray(raw) ? raw : [];
    if (req.method === "GET") {
      return new Response(JSON.stringify(list), { status: 200, headers: CORS });
    }
    if (req.method === "POST") {
      const rec = await req.json().catch(() => ({} as any));
      if (!rec || !rec.surname || rec.percent == null) {
        return new Response(JSON.stringify({ error: "bad record" }), { status: 400, headers: CORS });
      }
      const body: any = {
        surname: String(rec.surname).toLowerCase().trim(),
        display: rec.display || rec.surname,
        model: rec.model || "t4l",
        exam: Number(rec.exam || 1),
        percent: Number(rec.percent),
        at: rec.at || new Date().toISOString(),
        attempts: rec.attempts || 1,
        status: rec.status || "done",
      };
      if (rec.ok != null) body.ok = Number(rec.ok);
      if (rec.n != null) body.n = Number(rec.n);
      const next = mergeCloud(list, [body]);
      await store.setJSON("locks", next);
      return new Response(JSON.stringify({ ok: true, rec: body, n: next.length }), { status: 201, headers: CORS });
    }
    return new Response(JSON.stringify({ error: "method" }), { status: 405, headers: CORS });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e.message || e) }), { status: 500, headers: CORS });
  }
};

export const config = {
  path: "/api/rating",
};
