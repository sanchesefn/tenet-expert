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
SKIP_TYPES = {"pass", "login"}
STAFF = {
    "ахмадуллин": "Ахмадуллин",
    "демьянов": "Демьянов",
    "коропец": "Коропец",
    "лавров": "Лавров",
    "сидоров": "Сидоров",
    "спицын": "Спицын",
    "тальков": "Тальков",
    "кокуркин": "Кокуркин",
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


def rec_key(x):
    if not x:
        return None
    t = x.get("type")
    if t == "login":
        return ("login", x.get("surname"))
    if t == "pass":
        return ("pass", x.get("surname"), x.get("model"), str(x.get("code") or "").upper())
    if t == "pin_request":
        return ("pin", x.get("kind") or "login", x.get("surname"), x.get("model"), x.get("at"))
    return ("exam", x.get("surname"), x.get("model"), int(x.get("exam") or 1))


def better(a, b):
    if not a:
        return b
    if not b:
        return a
    if a.get("type") or b.get("type"):
        out = dict(a)
        out.update(b)
        if a.get("tgSent") or b.get("tgSent"):
            out["tgSent"] = True
        return out
    ad = a.get("status") != "running"
    bd = b.get("status") != "running"
    if ad and not bd:
        out = dict(a)
        out["status"] = "done"
        out.pop("run", None)
        if a.get("tgSent") or b.get("tgSent"):
            out["tgSent"] = True
        return out
    if bd and not ad:
        out = dict(b)
        out["status"] = "done"
        out.pop("run", None)
        if a.get("tgSent") or b.get("tgSent"):
            out["tgSent"] = True
        return out
    ap, bp = a.get("percent") or 0, b.get("percent") or 0
    win, lose = (b, a) if bp > ap else (a, b) if ap > bp else ((b, a) if str(b.get("at") or "") >= str(a.get("at") or "") else (a, b))
    out = dict(lose)
    out.update(win)
    if ad or bd:
        out["status"] = "done"
        out.pop("run", None)
    if a.get("tgSent") or b.get("tgSent"):
        out["tgSent"] = True
    return out


def merge_lists(old, new):
    order = []
    store = {}
    for x in (old or []) + (new or []):
        k = rec_key(x)
        if k is None:
            continue
        if k not in store:
            order.append(k)
            store[k] = x
        else:
            store[k] = better(store[k], x)
    return [store[k] for k in order]


def push(lst):
    fresh = pull()
    merged = merge_lists(fresh, lst)
    form_post(f"https://rentry.co/api/edit/{CLOUD_ID}", {"edit_code": CLOUD_KEY, "text": json.dumps(merged, ensure_ascii=False)})
    return merged


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


def make_pin():
    return "".join(random.choice("23456789") for _ in range(4))


def targets():
    return CHAT_ALLOW


def notify_new(lst):
    changed = False
    chats = targets()
    if not chats:
        return False
    pending = [x for x in lst if x and not x.get("type") and x.get("status") == "done" and not x.get("tgSent")]
    print("pending results", len(pending), [(x.get("display"), x.get("model"), x.get("percent")) for x in pending])
    for rec in lst:
        if not rec or rec.get("type") in SKIP_TYPES:
            continue
        if rec.get("type") == "pin_request":
            if rec.get("tgSent"):
                continue
            name = rec.get("display") or rec.get("surname") or "?"
            kind = rec.get("kind") or "login"
            try:
                if kind == "retake":
                    mid = rec.get("model") or "t4l"
                    text = (
                        f"Запрос кода пересдачи\n"
                        f"{name} · {MODELS.get(str(mid), mid)}\n"
                        f"Выдать: код {name} {mid}"
                    )
                else:
                    sn = " ".join((name or "").split()).lower()
                    pin = next((x for x in lst if x and x.get("type") == "login" and x.get("surname") == sn and x.get("code")), None)
                    if pin is None:
                        pin = upsert_login(lst, name)
                    text = (
                        f"Запрос кода входа\n"
                        f"{name}\n"
                        f"Личный код: {pin['code']}\n\n"
                        f"Менеджер вводит фамилию и этот код на сайте."
                    )
                ok_all = True
                for chat in chats:
                    try:
                        send(chat, text)
                    except Exception as e:
                        ok_all = False
                        print("send fail", e)
                if ok_all:
                    rec["tgSent"] = True
                    rec["resolvedAt"] = datetime.now(timezone.utc).isoformat()
                    changed = True
            except Exception as e:
                print("pin_request fail", e)
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
        for chat in chats:
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
    rec = {
        "type": "pass",
        "surname": " ".join((surname or "").split()).lower(),
        "display": surname.strip(),
        "model": mid,
        "code": make_code(),
        "used": False,
        "at": datetime.now(timezone.utc).isoformat(),
    }
    lst.append(rec)
    return push(lst) or lst


def upsert_login(lst, surname, pin=None):
    sn = " ".join((surname or "").split()).lower()
    code = (pin or make_pin()).strip().upper()
    rec = None
    for x in lst:
        if x and x.get("type") == "login" and x.get("surname") == sn:
            x["code"] = code
            x["display"] = surname.strip()
            x["at"] = datetime.now(timezone.utc).isoformat()
            rec = x
            break
    if rec is None:
        rec = {
            "type": "login",
            "surname": sn,
            "display": surname.strip(),
            "code": code,
            "at": datetime.now(timezone.utc).isoformat(),
        }
        lst.append(rec)
    push(lst)
    return rec


HELP = (
    "Бот РОП TENET / CHERY\n\n"
    "Личный вход:\n"
    "пин Иванов\n"
    "пин Иванов 4821\n"
    "пины\n"
    "спицын  ← фамилия из состава = выдать пин\n\n"
    "Код на пересдачу:\n"
    "код Иванов t4l\n\n"
    "Модели: t4l t7 t8 t9 a8"
)


def handle_text(chat_id, text, lst):
    t = (text or "").strip()
    low = t.lower().replace("ё", "е")
    if low in ("/start", "старт", "/help", "помощь"):
        send(chat_id, HELP)
        return lst
    if low in ("пины", "/пины"):
        pins = [x for x in lst if x and x.get("type") == "login"]
        if not pins:
            send(chat_id, "Личных кодов пока нет. Выдайте: пин Иванов")
            return lst
        lines = [f"{x.get('display') or x.get('surname')}: {x.get('code')}" for x in pins]
        send(chat_id, "Личные коды входа:\n" + "\n".join(lines))
        return lst
    if low.startswith("пин ") or low.startswith("/pin ") or low.startswith("/пин "):
        parts = t.split()
        if parts[0].lower().replace("ё", "е") in ("/pin", "/пин", "пин"):
            parts = parts[1:]
        if not parts:
            send(chat_id, "Формат: пин Фамилия\nили: пин Фамилия 4821")
            return lst
        given = None
        if len(parts) >= 2 and parts[-1].isdigit() and 4 <= len(parts[-1]) <= 6:
            given = parts[-1]
            parts = parts[:-1]
        if not parts:
            send(chat_id, "Укажите фамилию.")
            return lst
        rec = upsert_login(lst, " ".join(parts), given)
        send(chat_id, (
            f"Вход для {rec['display']}:\n"
            f"код {rec['code']}\n\n"
            "Менеджер вводит фамилию и этот код на сайте."
        ))
        return pull()
    if low.startswith("/code") or low.startswith("код ") or low.startswith("/код"):
        parts = t.replace("/code", "код", 1).replace("/код", "код", 1).split()
        if len(parts) < 3:
            send(chat_id, "Формат: код Фамилия модель\nПример: код Иванов t4l")
            return lst
        mid = model_id(parts[-1])
        if not mid:
            send(chat_id, "Не понял модель. Используйте t4l, t7, t8, t9 или a8.")
            return lst
        recs = issue_code(lst, " ".join(parts[1:-1]), mid)
        rec = next((x for x in recs if x and x.get("type") == "pass" and x.get("surname") == " ".join(parts[1:-1]).lower() and x.get("model") == mid), None)
        if rec is None:
            rec = recs[-1] if recs else {"display": " ".join(parts[1:-1]), "code": "?"}
        send(chat_id, (
            f"Код для {rec.get('display')} / {MODELS.get(mid, mid)}:\n"
            f"{rec.get('code')}\n\n"
            "Менеджер вводит его в поле «Код РОП» на сайте. Один раз."
        ))
        return pull()
    if low in ("/list", "список"):
        people = [x for x in lst if x and x.get("status") == "done" and x.get("type") not in SKIP_TYPES]
        if not people:
            send(chat_id, "Пока нет сданных попыток.")
            return lst
        lines = [f"{x.get('display') or x.get('surname')} {x.get('model')} №{x.get('exam') or 1} {x.get('percent')}%" for x in people[-20:]]
        send(chat_id, "Последние сдачи:\n" + "\n".join(lines))
        return lst
    key = low.strip()
    if key in STAFF:
        rec = upsert_login(lst, STAFF[key])
        send(chat_id, (
            f"Вход для {rec['display']}:\n"
            f"код {rec['code']}\n\n"
            "Менеджер вводит фамилию и этот код на сайте."
        ))
        return pull()
    send(chat_id, "Не понял команду.\n\n" + HELP)
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
        if chat is None:
            continue
        if not allowed(chat):
            for rop in targets():
                try:
                    send(rop, f"Бот получил сообщение не из чата РОП ({chat}):\n{text[:200]}")
                except Exception as e:
                    print("forward fail", e)
            continue
        lst = handle_text(chat, text, lst)
    if last_id is not None:
        try:
            tg("getUpdates", {"offset": last_id + 1, "timeout": 0})
        except Exception:
            pass


if __name__ == "__main__":
    main()
