#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lemnity cold-mailer — отправка холодных цепочек через Gmail (SMTP + App Password).

Только стандартная библиотека Python 3.8+. Состояние — в SQLite (state.sqlite).
Письма цепочки склеиваются в один тред Gmail (In-Reply-To / References + "Re:").

Команды:
  python mailer.py import <csv> [--sequence studio|business] [--city ГОРОД]
  python mailer.py run    [--dry-run] [--limit N]
  python mailer.py status
  python mailer.py stop   <email> [--reason replied|unsubscribed|bounced]

Типичный цикл: один раз импортируете список → дальше `run` гоняется по cron раз в
день; движок сам решает, кому пора слать письмо 1, кому 2 (через 3 дня), кому 3
(через 7 дней), и держит дневной лимит.

Конфиг — рядом лежащий .env (см. .env.example).
"""

import argparse
import csv
import os
import random
import smtplib
import sqlite3
import sys
import time
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formatdate, make_msgid

import templates

HERE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(HERE, "state.sqlite")
ENV_PATH = os.path.join(HERE, ".env")


# --------------------------------------------------------------------------- #
# конфиг
# --------------------------------------------------------------------------- #
def load_env(path=ENV_PATH):
    cfg = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, val = line.partition("=")
                val = val.strip().strip('"').strip("'")
                cfg[key.strip()] = val
    # переменные окружения имеют приоритет над файлом
    for k in list(cfg) + [
        "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS",
        "SENDER_NAME", "REPLY_TO", "DEMO_LINK", "PARTNER_LINK", "COMMISSION",
        "SENDER_TELEGRAM", "DAILY_LIMIT", "SEND_MIN_DELAY", "SEND_MAX_DELAY",
    ]:
        if os.environ.get(k):
            cfg[k] = os.environ[k]
    return cfg


def cfg_get(cfg, key, default=None, required=False):
    val = cfg.get(key, default)
    if required and not val:
        sys.exit(f"[ошибка] не задан {key} в .env")
    return val


# --------------------------------------------------------------------------- #
# база
# --------------------------------------------------------------------------- #
SCHEMA = """
CREATE TABLE IF NOT EXISTS contacts (
  email         TEXT PRIMARY KEY,
  company       TEXT,
  name          TEXT,
  website       TEXT,
  city          TEXT,
  sequence      TEXT NOT NULL DEFAULT 'studio',
  step          INTEGER NOT NULL DEFAULT 0,   -- сколько писем уже отправлено (0..3)
  first_sent_at TEXT,
  last_sent_at  TEXT,
  thread_msgid  TEXT,                          -- Message-ID первого письма (для треда)
  subject       TEXT,                          -- тема первого письма
  status        TEXT NOT NULL DEFAULT 'active',-- active|done|replied|unsubscribed|bounced
  note          TEXT,
  added_at      TEXT
);
CREATE TABLE IF NOT EXISTS send_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL,
  step       INTEGER NOT NULL,
  message_id TEXT,
  subject    TEXT,
  sent_at    TEXT NOT NULL
);
"""


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def parse_iso(s):
    return datetime.fromisoformat(s) if s else None


# --------------------------------------------------------------------------- #
# импорт CSV
# --------------------------------------------------------------------------- #
def _find_col(headers, *needles):
    for h in headers:
        low = h.lower()
        if any(n in low for n in needles):
            return h
    return None


def cmd_import(args):
    cfg = load_env()
    conn = get_conn()
    with open(args.csv, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        col_email = _find_col(headers, "email", "e-mail", "почт")
        col_name = _find_col(headers, "contact", "person", "имя", "контакт")
        col_company = _find_col(headers, "company", "студия", "название") or headers[0]
        col_site = next(
            (h for h in headers
             if ("website" in h.lower() or "сайт" in h.lower()
                 or h.lower() == "url") and "profile" not in h.lower()),
            None,
        )
        col_note = _find_col(headers, "заметк", "note")
        col_city = _find_col(headers, "city", "город")

        if not col_email:
            sys.exit(f"[ошибка] в CSV не найдена колонка с email. Заголовки: {headers}")

        added = skipped = blank = 0
        for row in reader:
            email = (row.get(col_email) or "").strip().lower()
            if not email or "@" not in email:
                blank += 1
                continue
            city = (row.get(col_city) or "").strip() if col_city else (args.city or "")
            cur = conn.execute(
                """INSERT OR IGNORE INTO contacts
                   (email, company, name, website, city, sequence, note, added_at)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (
                    email,
                    (row.get(col_company) or "").strip(),
                    (row.get(col_name) or "").strip() if col_name else "",
                    (row.get(col_site) or "").strip() if col_site else "",
                    city,
                    args.sequence,
                    (row.get(col_note) or "").strip() if col_note else "",
                    now_iso(),
                ),
            )
            if cur.rowcount:
                added += 1
            else:
                skipped += 1
        conn.commit()
    print(f"Импорт {os.path.basename(args.csv)} → цепочка '{args.sequence}': "
          f"добавлено {added}, уже были {skipped}, без email {blank}")


# --------------------------------------------------------------------------- #
# отбор тех, кому пора слать
# --------------------------------------------------------------------------- #
def sent_today(conn):
    today = datetime.now(timezone.utc).date().isoformat()
    row = conn.execute(
        "SELECT COUNT(*) c FROM send_log WHERE substr(sent_at,1,10)=?", (today,)
    ).fetchone()
    return row["c"]


def due_contacts(conn, now):
    rows = conn.execute(
        "SELECT * FROM contacts WHERE status='active' ORDER BY first_sent_at IS NULL, first_sent_at, added_at"
    ).fetchall()
    followups, fresh = [], []
    for r in rows:
        step = r["step"]
        seq = r["sequence"]
        if step >= len(templates.SEQUENCES[seq]):
            continue  # цепочка пройдена (статус обновится при отправке последнего)
        offset = templates.offsets(seq)[step]
        if step == 0:
            fresh.append(r)  # первое письмо — шлём сразу
        else:
            first = parse_iso(r["first_sent_at"])
            if first and now >= first + timedelta(days=offset):
                followups.append(r)
    # follow-up'ы важнее новых: тёплый тред ценнее, и бережём доставляемость
    return followups + fresh


# --------------------------------------------------------------------------- #
# сборка и отправка письма
# --------------------------------------------------------------------------- #
def build_message(cfg, contact, step, subject, body):
    msg = EmailMessage()
    sender_name = cfg_get(cfg, "SENDER_NAME", "Lemnity")
    # для real-send наличие SMTP_USER уже проверено в _connect_smtp;
    # тут даём дефолт, чтобы работал --dry-run без заполненного .env
    smtp_user = cfg_get(cfg, "SMTP_USER", "you@example.com")
    msg["From"] = f"{sender_name} <{smtp_user}>"
    msg["To"] = contact["email"]
    reply_to = cfg_get(cfg, "REPLY_TO")
    if reply_to:
        msg["Reply-To"] = reply_to
    msg["Date"] = formatdate(localtime=True)
    msgid = make_msgid(domain=smtp_user.split("@")[-1])
    msg["Message-ID"] = msgid

    if step == 0:
        msg["Subject"] = subject
    else:
        base = contact["subject"] or subject or ""
        msg["Subject"] = base if base.lower().startswith("re:") else f"Re: {base}"
        thread = contact["thread_msgid"]
        if thread:
            msg["In-Reply-To"] = thread
            msg["References"] = thread

    msg.set_content(body)
    return msg, msgid


def fields_for(cfg, contact):
    return {
        "recipient_name": contact["name"] or "",
        "company": contact["company"] or "",
        "website": contact["website"] or "",
        "city": contact["city"] or "",
        "commission": cfg_get(cfg, "COMMISSION", "20–30%"),
        "demo_link": cfg_get(cfg, "DEMO_LINK", ""),
        "partner_link": cfg_get(cfg, "PARTNER_LINK", ""),
        "sender_name": cfg_get(cfg, "SENDER_NAME", "Lemnity"),
        "sender_email": cfg_get(cfg, "REPLY_TO") or cfg_get(cfg, "SMTP_USER", ""),
        "sender_telegram": cfg_get(cfg, "SENDER_TELEGRAM", "@lemnity_ru"),
    }


def cmd_run(args):
    cfg = load_env()
    conn = get_conn()
    now = datetime.now(timezone.utc)

    daily_limit = int(cfg_get(cfg, "DAILY_LIMIT", "25"))
    already = sent_today(conn)
    remaining = daily_limit - already
    if args.limit is not None:
        remaining = min(remaining, args.limit)
    if remaining <= 0:
        print(f"Дневной лимит исчерпан ({already}/{daily_limit}). Выходим.")
        return

    queue = due_contacts(conn, now)[:remaining]
    if not queue:
        print("Никому слать не нужно — все письма по графику отправлены.")
        return

    min_delay = int(cfg_get(cfg, "SEND_MIN_DELAY", "30"))
    max_delay = int(cfg_get(cfg, "SEND_MAX_DELAY", "90"))

    mode = "DRY-RUN (ничего не отправляется)" if args.dry_run else "ОТПРАВКА"
    print(f"[{mode}] лимит {daily_limit}/день, уже сегодня {already}, "
          f"в очереди {len(queue)}")

    server = None
    if not args.dry_run:
        server = _connect_smtp(cfg)

    try:
        for i, c in enumerate(queue):
            step = c["step"]
            subject, body = templates.render_step(c["sequence"], step, fields_for(cfg, c))
            msg, msgid = build_message(cfg, c, step, subject, body)
            label = f"{c['email']} · шаг {step + 1}/{len(templates.SEQUENCES[c['sequence']])}"

            if args.dry_run:
                print(f"\n{'='*70}\n{label}")
                print(f"Subject: {msg['Subject']}")
                print(f"{'-'*70}\n{body}")
                continue

            try:
                server.send_message(msg)
            except Exception as e:  # noqa
                print(f"[ошибка] {label}: {e}")
                continue

            _record_send(conn, c, step, msg, msgid, now_iso())
            print(f"✓ отправлено: {label}")

            if i < len(queue) - 1:
                time.sleep(random.randint(min_delay, max_delay))
    finally:
        if server:
            server.quit()

    if not args.dry_run:
        print(f"\nГотово. Сегодня отправлено всего: {sent_today(conn)}/{daily_limit}")


def _connect_smtp(cfg):
    host = cfg_get(cfg, "SMTP_HOST", "smtp.gmail.com")
    port = int(cfg_get(cfg, "SMTP_PORT", "465"))
    user = cfg_get(cfg, "SMTP_USER", required=True)
    pwd = cfg_get(cfg, "SMTP_PASS", required=True)
    if port == 465:
        server = smtplib.SMTP_SSL(host, port, timeout=30)
    else:
        server = smtplib.SMTP(host, port, timeout=30)
        server.starttls()
    server.login(user, pwd)
    return server


def _record_send(conn, contact, step, msg, msgid, ts):
    new_step = step + 1
    seq_len = len(templates.SEQUENCES[contact["sequence"]])
    status = "done" if new_step >= seq_len else "active"
    if step == 0:
        conn.execute(
            """UPDATE contacts SET step=?, first_sent_at=?, last_sent_at=?,
               thread_msgid=?, subject=?, status=? WHERE email=?""",
            (new_step, ts, ts, msgid, msg["Subject"], status, contact["email"]),
        )
    else:
        conn.execute(
            "UPDATE contacts SET step=?, last_sent_at=?, status=? WHERE email=?",
            (new_step, ts, status, contact["email"]),
        )
    conn.execute(
        "INSERT INTO send_log (email, step, message_id, subject, sent_at) VALUES (?,?,?,?,?)",
        (contact["email"], new_step, msgid, msg["Subject"], ts),
    )
    conn.commit()


# --------------------------------------------------------------------------- #
# статус / стоп
# --------------------------------------------------------------------------- #
def cmd_status(args):
    conn = get_conn()
    print("Контакты по статусам:")
    for r in conn.execute(
        "SELECT status, COUNT(*) c FROM contacts GROUP BY status ORDER BY c DESC"
    ):
        print(f"  {r['status']:<14} {r['c']}")
    print("\nАктивные по шагу (уже отправлено писем):")
    for r in conn.execute(
        "SELECT step, COUNT(*) c FROM contacts WHERE status='active' GROUP BY step ORDER BY step"
    ):
        print(f"  шаг {r['step']}: {r['c']}")
    print(f"\nОтправлено сегодня: {sent_today(conn)}")
    total = conn.execute("SELECT COUNT(*) c FROM send_log").fetchone()["c"]
    print(f"Всего писем отправлено: {total}")


def cmd_stop(args):
    conn = get_conn()
    cur = conn.execute(
        "UPDATE contacts SET status=? WHERE email=?",
        (args.reason, args.email.lower().strip()),
    )
    conn.commit()
    if cur.rowcount:
        print(f"{args.email} → статус '{args.reason}' (письма по цепочке остановлены)")
    else:
        print(f"{args.email} не найден")


# --------------------------------------------------------------------------- #
def main():
    p = argparse.ArgumentParser(description="Lemnity cold-mailer (Gmail SMTP)")
    sub = p.add_subparsers(dest="cmd", required=True)

    pi = sub.add_parser("import", help="загрузить контакты из CSV")
    pi.add_argument("csv")
    pi.add_argument("--sequence", choices=list(templates.SEQUENCES), default="studio")
    pi.add_argument("--city", default="", help="город по умолчанию, если нет колонки")
    pi.set_defaults(func=cmd_import)

    pr = sub.add_parser("run", help="отправить письма, кому пора (по графику и лимиту)")
    pr.add_argument("--dry-run", action="store_true", help="показать, но не отправлять")
    pr.add_argument("--limit", type=int, help="разовый потолок на этот запуск")
    pr.set_defaults(func=cmd_run)

    ps = sub.add_parser("status", help="сводка по базе")
    ps.set_defaults(func=cmd_status)

    pp = sub.add_parser("stop", help="остановить цепочку по контакту")
    pp.add_argument("email")
    pp.add_argument("--reason", choices=["replied", "unsubscribed", "bounced"],
                    default="replied")
    pp.set_defaults(func=cmd_stop)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
