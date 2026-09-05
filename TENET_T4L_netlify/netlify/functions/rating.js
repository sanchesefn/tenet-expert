const STORE = "https://crudcrud.com/api/9217d6b3554d4a80959fa527a673269f/locks";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  try {
    if (event.httpMethod === "GET") {
      const r = await fetch(STORE);
      const text = await r.text();
      return { statusCode: r.ok ? 200 : r.status, headers, body: text || "[]" };
    }
    if (event.httpMethod === "POST") {
      const rec = JSON.parse(event.body || "{}");
      if (!rec.surname || rec.percent == null) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "bad record" }) };
      }
      const listRes = await fetch(STORE);
      const list = listRes.ok ? await listRes.json() : [];
      const existing = list.find(
        (x) => x.surname === rec.surname && x.model === rec.model && Number(x.exam || 1) === Number(rec.exam || 1)
      );
      const body = {
        surname: rec.surname,
        display: rec.display || rec.surname,
        model: rec.model || "t4l",
        exam: Number(rec.exam || 1),
        percent: rec.percent,
        at: rec.at || new Date().toISOString(),
        attempts: rec.attempts || 1,
      };
      if (existing && existing._id) {
        const r = await fetch(STORE + "/" + existing._id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return { statusCode: r.ok ? 200 : r.status, headers, body: JSON.stringify(body) };
      }
      const r = await fetch(STORE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await r.text();
      return { statusCode: r.ok ? 201 : r.status, headers, body: text };
    }
    return { statusCode: 405, headers, body: JSON.stringify({ error: "method" }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e.message || e) }) };
  }
};
