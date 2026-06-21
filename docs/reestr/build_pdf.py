#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Сборка PDF «Инструкция по установке экземпляра ПО Lemnity» для реестра."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)

# --- Шрифты с поддержкой кириллицы ---
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
MONO = "/Library/Fonts/Arial Unicode.ttf"  # запасной моноширинный с кириллицей
pdfmetrics.registerFont(TTFont("Body", ARIAL))
pdfmetrics.registerFont(TTFont("Body-Bold", ARIAL_BD))
pdfmetrics.registerFont(TTFont("Mono", "/System/Library/Fonts/Supplemental/Courier New.ttf"))
pdfmetrics.registerFont(TTFont("Mono-Bold", "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"))

NAVY = colors.HexColor("#1f3a93")
GREY = colors.HexColor("#444444")
LIGHT = colors.HexColor("#f2f4f8")
BORDER = colors.HexColor("#d0d7e2")

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", fontName="Body-Bold", fontSize=20, leading=25,
                    textColor=NAVY, spaceAfter=4)
SUB = ParagraphStyle("SUB", fontName="Body", fontSize=10.5, leading=15,
                     textColor=GREY, spaceAfter=2)
H2 = ParagraphStyle("H2", fontName="Body-Bold", fontSize=13.5, leading=18,
                    textColor=NAVY, spaceBefore=16, spaceAfter=6)
H3 = ParagraphStyle("H3", fontName="Body-Bold", fontSize=11.5, leading=15,
                    textColor=colors.HexColor("#2a2a2a"), spaceBefore=9, spaceAfter=3)
BODY = ParagraphStyle("Body", fontName="Body", fontSize=10.5, leading=15,
                      textColor=colors.HexColor("#1a1a1a"), alignment=TA_JUSTIFY,
                      spaceAfter=5)
NOTE = ParagraphStyle("Note", parent=BODY, fontSize=9.8, textColor=GREY,
                      leftIndent=8, borderColor=BORDER)
BULLET = ParagraphStyle("Bullet", parent=BODY, leftIndent=14, bulletIndent=2,
                        spaceAfter=2, alignment=TA_JUSTIFY)
CODE = ParagraphStyle("Code", fontName="Mono", fontSize=9, leading=12.5,
                      textColor=colors.HexColor("#0b2540"))
CELL = ParagraphStyle("Cell", fontName="Body", fontSize=9.8, leading=13,
                      textColor=colors.HexColor("#1a1a1a"))
CELL_B = ParagraphStyle("CellB", parent=CELL, fontName="Body-Bold")

story = []


def h2(t): story.append(Paragraph(t, H2))
def h3(t): story.append(Paragraph(t, H3))
def p(t): story.append(Paragraph(t, BODY))
def sp(h=6): story.append(Spacer(1, h))


def bullets(items):
    for it in items:
        story.append(Paragraph(it, BULLET, bulletText="•"))


def code_block(lines):
    txt = "<br/>".join(
        l.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        for l in lines)
    tbl = Table([[Paragraph(txt, CODE)]], colWidths=[165 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f6f8fa")),
        ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, NAVY),
    ]))
    story.append(tbl)
    sp(6)


def kv_table(rows):
    data = [[Paragraph(k, CELL_B), Paragraph(v, CELL)] for k, v in rows]
    tbl = Table(data, colWidths=[52 * mm, 113 * mm])
    tbl.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(tbl)
    sp(6)


# ===== Титул =====
story.append(Paragraph("Инструкция по установке экземпляра программного обеспечения «Lemnity»", H1))
sp(2)
story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=8))
story.append(Paragraph(
    "<b>Назначение документа.</b> Настоящая инструкция описывает порядок установки и запуска "
    "экземпляра программного обеспечения «Lemnity» (далее — ПО), предоставленного для проведения "
    "экспертной проверки в целях включения в единый реестр российских программ для электронных "
    "вычислительных машин и баз данных.", BODY))
story.append(Paragraph(
    "Поля в угловых скобках &lt;...&gt; необходимо заменить фактическими значениями перед подачей.",
    NOTE))

# ===== 1 =====
h2("1. Общие сведения")
kv_table([
    ("Наименование ПО", "Lemnity"),
    ("Версия", "0.2.2"),
    ("Назначение", "Размещение на веб-сайте чат-виджета (онлайн-консультанта): приём обращений "
                   "посетителей, ведение диалогов операторами, настройка сценариев и внешнего вида "
                   "виджета, сбор аналитики обращений"),
    ("Правообладатель", "ООО «Лемнити» (ИНН 7203599939, ОГРН 1257200016952)"),
    ("Тип поставки", "Серверное ПО, разворачивается в контейнерах Docker"),
])

# ===== 2 =====
h2("2. Требования к аппаратному и программному обеспечению")
h3("Аппаратные требования (минимально)")
bullets(["CPU: 4 ядра", "RAM: 8 ГБ", "Диск: 40 ГБ свободного пространства"])
h3("Программные требования")
bullets([
    "Операционная система: Linux (рекомендуется <b>Astra Linux</b>; поддерживаются "
    "Debian/CentOS-совместимые дистрибутивы)",
    "<b>Docker</b> версии 24.0 и выше",
    "<b>Docker Compose</b> v2 (плагин <font name='Mono'>docker compose</font>)",
    "Доступ в сеть Интернет для загрузки образов контейнеров",
])

# ===== 3 =====
h2("3. Состав поставляемого экземпляра")
p("Экземпляр ПО передаётся в виде архива <font name='Mono'>lemnity-&lt;версия&gt;.tar.gz</font>, "
  "содержащего:")
bullets([
    "<font name='Mono'>docker-compose.prod.yml</font> — описание состава и параметров запуска контейнеров;",
    "<font name='Mono'>.env</font> — файл параметров окружения (заполнен значениями для проверки);",
    "каталог <font name='Mono'>clickhouse-config/</font> — конфигурация аналитической СУБД;",
    "образы контейнеров (<font name='Mono'>images/*.tar</font>) либо реквизиты доступа к реестру образов;",
    "настоящую инструкцию.",
])
p("<b>Состав сервисов:</b> веб-сервер/обратный прокси (Nginx), сервер приложений (Node.js/NestJS), "
  "коллектор событий, шлюз очередей (RabbitMQ), СУБД PostgreSQL, аналитическая СУБД ClickHouse, "
  "объектное хранилище MinIO (S3-совместимое).")

# ===== 4 =====
h2("4. Порядок установки")
h3("4.1. Подготовка")
p("1. Распаковать архив в рабочий каталог:")
code_block(["tar -xzf lemnity-<версия>.tar.gz -C ~/lemnity && cd ~/lemnity"])
p("2. Убедиться, что установлены Docker и Docker Compose:")
code_block(["docker --version", "docker compose version"])

h3("4.2. Загрузка образов контейнеров")
p("<b>Вариант А — образы поставлены в архиве:</b>")
code_block(['for img in images/*.tar; do docker load -i "$img"; done'])
p("<b>Вариант Б — образы загружаются из реестра</b> (требуется авторизация, реквизиты переданы отдельно):")
code_block([
    'echo "<TOKEN>" | docker login ghcr.io -u "<USER>" --password-stdin',
    "docker compose -f docker-compose.prod.yml pull",
])

h3("4.3. Запуск инфраструктурных сервисов")
code_block(["docker compose -f docker-compose.prod.yml up -d postgres rabbitmq clickhouse"])
p("Дождаться состояния <font name='Mono'>healthy</font> всех трёх контейнеров:")
code_block(["docker compose -f docker-compose.prod.yml ps"])

h3("4.4. Инициализация базы данных")
code_block([
    "docker compose -f docker-compose.prod.yml run --rm server \\",
    "  pnpm --filter @lemnity/database exec prisma db push --accept-data-loss",
])

h3("4.5. Запуск полного стека")
code_block([
    "docker compose -f docker-compose.prod.yml up -d --force-recreate --remove-orphans",
    "docker compose -f docker-compose.prod.yml --profile setup run --rm minio_setup",
])

h3("4.6. Проверка состояния")
code_block(["docker compose -f docker-compose.prod.yml ps"])
p("Все сервисы должны находиться в состоянии <font name='Mono'>running</font> / "
  "<font name='Mono'>healthy</font>.")

# ===== 5 =====
h2("5. Доступ к экземпляру и проверка работоспособности")
bullets([
    "Открыть в браузере веб-интерфейс: <font name='Mono'>http://&lt;адрес-сервера&gt;/</font>",
    "Войти с тестовой учётной записью — логин: <font name='Mono'>&lt;demo-login&gt;</font>, "
    "пароль: <font name='Mono'>&lt;demo-password&gt;</font>",
    "Демонстрация целевой функции: открыть страницу с виджетом "
    "<font name='Mono'>http://&lt;адрес-сервера&gt;/&lt;страница&gt;</font> — в правом нижнем углу "
    "отображается чат-виджет; отправленное сообщение поступает оператору в веб-интерфейс.",
])
story.append(Paragraph(
    "<b>Признак успешной установки:</b> веб-интерфейс доступен, выполняется вход, чат-виджет "
    "отображается на странице и обеспечивает обмен сообщениями между посетителем и оператором.",
    NOTE))

# ===== 6 =====
h2("6. Остановка и удаление экземпляра")
code_block([
    "docker compose -f docker-compose.prod.yml down        # остановить",
    "docker compose -f docker-compose.prod.yml down -v     # остановить и удалить данные",
])

# ===== 7 =====
h2("7. Контакты для проведения проверки")
kv_table([
    ("Правообладатель", "ООО «Лемнити»"),
    ("E-mail", "hello@lemnity.ru"),
    ("Telegram", "@lemnity_ru"),
    ("Адрес", "г. Тюмень, ул. Пышминская, 103"),
])


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Body", 8)
    canvas.setFillColor(GREY)
    canvas.drawString(20 * mm, 12 * mm, "Lemnity 0.2.2 — Инструкция по установке экземпляра ПО")
    canvas.drawRightString(190 * mm, 12 * mm, "стр. %d" % doc.page)
    canvas.setStrokeColor(BORDER)
    canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.restoreState()


doc = SimpleDocTemplate(
    "/Users/thesimakov/Documents/GitHub/lemnity/docs/reestr/Инструкция_по_установке_Lemnity.pdf",
    pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
    topMargin=18 * mm, bottomMargin=20 * mm,
    title="Инструкция по установке экземпляра ПО Lemnity",
    author="Lemnity")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("OK")
