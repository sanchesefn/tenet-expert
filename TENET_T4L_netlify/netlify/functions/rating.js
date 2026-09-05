const { getStore } = require("@netlify/blobs");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

function keyOf(rec) {
  return [String(rec.surname || "").toLowerCase(), rec.model || "t4l", String(rec.exam || 1)].join("|");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  try {
    const store = getStore("tenet-rating");
    const raw = await store.get("locks", { type: "json" });
    let list = Array.isArray(raw) ? raw : [];

    if (event.httpMethod === "GET") {
      return { statusCode: 200, headers, body: JSON.stringify(list) };
    }

    if (event.httpMethod === "POST") {
      const rec = JSON.parse(event.body || "{}");
      if (!rec.surname || rec.percent == null) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "bad record" }) };
      }
      const body = {
        surname: rec.surname,
        display: rec.display || rec.surname,
        model: rec.model || "t4l",
        exam: Number(rec.exam || 1),
        percent: rec.percent,
        at: rec.at || new Date().toISOString(),
        attempts: rec.attempts || 1,
      };
      const k = keyOf(body);
      const idx = list.findIndex((x) => keyOf(x) === k);
      if (idx >= 0) list[idx] = body;
      else list.push(body);
      await store.setJSON("locks", list);
      return { statusCode: 201, headers, body: JSON.stringify(body) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "method" }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
