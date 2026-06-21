# Lemnity cold-mailer

Автоотправка холодных цепочек через Gmail (SMTP + App Password). Чистый Python,
без зависимостей. Состояние — в `state.sqlite`. Письма цепочки склеиваются в один
тред Gmail (follow-up уходит как `Re:` в тот же диалог).

## Что внутри
- `mailer.py` — движок (import / run / status / stop).
- `templates.py` — тексты цепочек: `studio` (веб-студии, white-label) и
  `business` (прямой клиент). Правьте тексты прямо тут.
- `.env.example` — конфиг (скопировать в `.env`).

## Настройка (один раз)

1. **App Password в Google.** Включите 2FA на аккаунте, затем
   https://myaccount.google.com/apppasswords → создайте пароль приложения (16 символов).
   Обычный пароль от почты SMTP Gmail не примет.

2. **Конфиг:**
   ```bash
   cd plan/email-sender
   cp .env.example .env
   # впишите SMTP_USER, SMTP_PASS (app password), ссылки DEMO_LINK/PARTNER_LINK
   ```

3. **Импорт контактов** (можно несколько списков):
   ```bash
   python3 mailer.py import ../ekaterinburg-studios-emails.csv --sequence studio --city Екатеринбург
   python3 mailer.py import ../workspace-tyumen-developers.csv  --sequence studio
   ```
   Колонки (email / имя / сайт / город / заметка) определяются автоматически.
   Строки без email пропускаются.

## Ежедневный прогон

```bash
python3 mailer.py run --dry-run   # сначала посмотреть, что уйдёт
python3 mailer.py run             # реальная отправка
```

Движок сам решает по каждому контакту:
- письмо 1 — сразу;
- письмо 2 — через 3 дня после первого, в тот же тред;
- письмо 3 — через 7 дней после первого, в тот же тред.

Держится дневной лимит (`DAILY_LIMIT`, по умолчанию 25), между письмами —
случайная пауза 30–90 с. Follow-up'ы отправляются раньше новых первых писем.

## Кто-то ответил / отписался

Авто-детекта ответов нет (для SMTP нужен был бы IMAP-опрос — это отдельно).
Чтобы остановить цепочку по контакту вручную:
```bash
python3 mailer.py stop studio@example.ru --reason replied
```
`--reason`: `replied` | `unsubscribed` | `bounced`.

## Статус

```bash
python3 mailer.py status
```

## Автозапуск по cron (раз в день, будни, утро)

```cron
# crontab -e  — вт–чт в 10:00 (лучшее время для первого касания)
0 10 * * 2-4 cd /Users/thesimakov/Documents/GitHub/lemnity/plan/email-sender && /usr/bin/python3 mailer.py run >> run.log 2>&1
```

## Памятка по доставляемости
- Прогрейте домен: начните с 5–10 писем/день, поднимайте постепенно.
- Картинки в первое письмо не вставляем — демо только ссылкой (уже так в шаблонах).
- Цель — реплай-рейт 5–10%. Ниже 3% → меняйте оффер/тему в `templates.py`, не объём.
- Перед импортом tyumen-списка проверьте колонку «Заметка»: мёртвые домены
  (ИнфоСистем, P6/ИП Губкин, ArtSky) уберите из CSV вручную.
