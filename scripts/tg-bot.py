#!/usr/bin/env python3
import json, os, random, urllib.parse, urllib.request
from datetime import datetime, timezone

CLOUD_ID = "o6nq7rki"
CLOUD_KEY = "4fmBrr2H"
TOKEN = os.environ.get("TG_BOT_TOKEN", "").strip()
CHAT_ALLOW = {x.strip() for x in os.environ.get("TG_CHAT_ID", "").split(",") if x.strip()}
MODELS = {
    "t4l": "T4L", "t7": "T7", "t8": "T8", "t9": "Tiggo 9", "a8": "Arrizo 8",
    "tiggo9": "Tiggo 9", "tiggo 9": "Tiggo 9", "arrizo8": "Arrizo 8", "arrizo 8": "Arrizo 8",
}

def req(url, data=None, timeout=20):
    body = None
    headers = {}
    if isinstance(data, dict):
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode()
    r = urllib.request.Request(url, data=body, headers=headers)
    with urllib.request.urlopen(r, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))

def form_post(url, fields):
    body = urllib.parse.urlencode(fields).encode()
    r = urllib.request.Request(url, data=body, headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(r, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))

def pull():
    data = form_post(f"https://rentry.co/api/fetch/{CLOUD_ID}", {"edit_code": CLOUD_KEY})
    content = data.get("content")
    text = content.get("text") if isinstance(content, dict) else (content if isinstance(content, str) else "")
    parsed = json.loads(text or "[]")
    return parsed if isinstance(parsed, list) else []

def push(lst):
    form_post(f"https://rentry.co/api/edit/{CLOUD_ID}", {"edit_code": CLOUD_KEY, "text": json.dumps(lst, ensure_ascii=False)})

def tg(method, payload):
    return req(f"https://api.telegram.org/bot{TOKEN}/{method}", payload)

def send(chat_id, text):
    tg("sendMessage", {"chat_id": chat_id, "text": text, "disable_web_page_preview": True})

def allowed(chat_id):
    if not CHAT_ALLOW:
        return True
    return str(chat_id) in CHAT_ALLOW

def model_id(raw):
    s = (raw or "").strip().lower().replace("ё", "е")
    aliases = {
        "t4l": "t4l", "t7": "t7", "t8": "t8", "t9": "t9", "a8": "a8",
        "tiggo 9": "t9", "tiggo9": "t9", "тигго 9": "t9", "тигго9": "t9",
        "arrizo 8": "a8", "arrizo8": "a8", "арризо 8": "a8", "арризо8": "a8",
    }
    return aliases.get(s)

def make_code():
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "РОП-" + "".join(random.choice(alphabet) for _ in range(4))

def notify_new(lst):
    changed = False
    targets = CHAT_ALLOW
    if not targets:
        return False
    for rec in lst:
        if not rec or rec.get("type") == "pass":
            continue
        if rec.get("status") != "done" or rec.get("tgSent"):
            continue
        exam = rec.get("exam") or 1
        name = rec.get("display") or rec.get("surname") or "?"
        model = MODELS.get(str(rec.get("model") or "t4l"), rec.get("model"))
        pct = rec.get("percent")
        kind = "пересдача" if int(exam) == 2 else "аттестация №1"
        mark = "закреплён эксперт" if (pct or 0) >= 90 else "нужна пересдача" if int(exam) == 1 else "пересдача сдана"
        text = (
            f"Результат: {name}\n"
            f"{model} · {kind} · {pct}%\n"
            f"{mark}\n"
            f"Выдать код: код {name} {rec.get('model')}"
        )
        ok_all = True
        for chat in targets:
            try:
                send(chat, text)
            except Exception as e:
                ok_all = False
                print("send fail", e)
        if ok_all:
            rec["tgSent"] = True
            changed = True
    if changed:
        push(lst)
    return changed

def issue_code(lst, surname, mid):
    sn = " ".join((surname or "").split()).lower()
    rec = {
        "type": "pass",
        "surname": sn,
        "display": surname.strip(),
        "model": mid,
        "code": make_code(),
        "used": False,
        "at": datetime.now(timezone.utc).isoformat(),
    }
    lst.append(rec)
    push(lst)
    return rec

def handle_text(chat_id, text, lst):
    t = (text or "").strip()
    low = t.lower().replace("ё", "е")
    if low in ("/start", "старт", "/help", "помощь"):
        send(chat_id, (
            "Бот РОП TENET / CHERY\n\n"
            "Сюда приходят результаты аттестаций.\n\n"
            "Выдать код:\n"
            "код Иванов t4l\n"
            "код Лавров t9\n\n"
            "Модели: t4l t7 t8 t9 a8\n"
            "Код одноразовый, только на эту фамилию и модель.\n"
            "Общий код РОП26 тоже работает."
        ))
        return lst
    if low.startswith("/code") or low.startswith("код ") or low.startswith("/код"):
        parts = t.replace("/code", "код", 1).replace("/код", "код", 1).split()
        if len(parts) < 3:
            send(chat_id, "Формат: код Фамилия модель\nПример: код Иванов t4l")
            return lst
        mid = model_id(parts[-1])
        if not mid:
            send(chat_id, "Не понял модель. Используйте t4l, t7, t8, t9 или a8.")
            return lst
        rec = issue_code(lst, " ".join(parts[1:-1]), mid)
        send(chat_id, (
            f"Код для {rec['display']} / {MODELS.get(mid, mid)}:\n"
            f"{rec['code']}\n\n"
            "Менеджер вводит его в поле «Код РОП» на сайте. Один раз."
        ))
        return pull()
    if low in ("/list", "список"):
        people = [x for x in lst if x and x.get("status") == "done" and x.get("type") != "pass"]
        if not people:
            send(chat_id, "Пока нет сданных попыток.")
            return lst
        lines = [f"{x.get('display') or x.get('surname')} {x.get('model')} №{x.get('exam') or 1} {x.get('percent')}%" for x in people[-20:]]
        send(chat_id, "Последние сдачи:\n" + "\n".join(lines))
        return lst
    return lst

def main():
    if not TOKEN:
        print("no TG_BOT_TOKEN")
        return
    lst = pull()
    notify_new(lst)
    lst = pull()
    data = tg("getUpdates", {"timeout": 0})
    last_id = None
    for upd in data.get("result") or []:
        last_id = upd.get("update_id", last_id)
        msg = upd.get("message") or upd.get("edited_message") or {}
        chat = (msg.get("chat") or {}).get("id")
        text = msg.get("text") or ""
        if chat is None or not allowed(chat):
            continue
        lst = handle_text(chat, text, lst)
    if last_id is not None:
        try:
            tg("getUpdates", {"offset": last_id + 1, "timeout": 0})
        except Exception:
            pass

if __name__ == "__main__":
    main()
