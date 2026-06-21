#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF документации программного модуля «Чат» ПО Lemnity (для публикации на сайте, реестр)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable)

pdfmetrics.registerFont(TTFont("Body", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("Body-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
pdfmetrics.registerFont(TTFont("Mono", "/System/Library/Fonts/Supplemental/Courier New.ttf"))

NAVY = colors.HexColor("#1f3a93")
GREY = colors.HexColor("#444444")
LIGHT = colors.HexColor("#f2f4f8")
BORDER = colors.HexColor("#d0d7e2")

H1 = ParagraphStyle("H1", fontName="Body-Bold", fontSize=18, leading=23, textColor=NAVY, spaceAfter=4)
H2 = ParagraphStyle("H2", fontName="Body-Bold", fontSize=13.5, leading=18, textColor=NAVY, spaceBefore=15, spaceAfter=6)
H3 = ParagraphStyle("H3", fontName="Body-Bold", fontSize=11.5, leading=15, textColor=colors.HexColor("#2a2a2a"), spaceBefore=8, spaceAfter=3)
BODY = ParagraphStyle("Body", fontName="Body", fontSize=10.5, leading=15, textColor=colors.HexColor("#1a1a1a"), alignment=TA_JUSTIFY, spaceAfter=5)
NOTE = ParagraphStyle("Note", parent=BODY, fontSize=9.8, textColor=GREY, leftIndent=8)
BULLET = ParagraphStyle("Bullet", parent=BODY, leftIndent=14, bulletIndent=2, spaceAfter=2)
STEP = ParagraphStyle("Step", parent=BODY, leftIndent=14, spaceAfter=2)
CELL = ParagraphStyle("Cell", fontName="Body", fontSize=9.6, leading=13, textColor=colors.HexColor("#1a1a1a"))
CELL_B = ParagraphStyle("CellB", parent=CELL, fontName="Body-Bold")
CODE = ParagraphStyle("Code", fontName="Mono", fontSize=9, leading=12.5, textColor=colors.HexColor("#0b2540"))

story = []
def h2(t): story.append(Paragraph(t, H2))
def h3(t): story.append(Paragraph(t, H3))
def p(t): story.append(Paragraph(t, BODY))
def note(t): story.append(Paragraph(t, NOTE))
def sp(h=6): story.append(Spacer(1, h))
def bullets(items):
    for it in items:
        story.append(Paragraph(it, BULLET, bulletText="•"))
def steps(items):
    for i, it in enumerate(items, 1):
        story.append(Paragraph("%d.&nbsp;&nbsp;%s" % (i, it), STEP))
def code_block(lines):
    txt = "<br/>".join(l.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") for l in lines)
    tbl = Table([[Paragraph(txt, CODE)]], colWidths=[165 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f6f8fa")),
        ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBEFORE", (0, 0), (0, -1), 2.5, NAVY),
    ]))
    story.append(tbl); sp(6)
def kv_table(rows, w0=52):
    data = [[Paragraph(k, CELL_B), Paragraph(v, CELL)] for k, v in rows]
    tbl = Table(data, colWidths=[w0 * mm, (165 - w0) * mm])
    tbl.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("BACKGROUND", (0, 0), (0, -1), LIGHT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(tbl); sp(6)

# ===== Титул =====
story.append(Paragraph("Документация программного модуля «Чат» программного обеспечения «Lemnity»", H1))
sp(2)
story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=8))
p("Настоящий документ содержит описание функциональных характеристик программного модуля «Чат» "
  "программного обеспечения «Lemnity», а также информацию, необходимую для его установки "
  "(подключения) и эксплуатации.")
kv_table([
    ("Программное обеспечение", "Lemnity, версия 0.2.2"),
    ("Программный модуль", "Чат (онлайн-консультант)"),
    ("Правообладатель", "ООО «Лемнити» (ИНН 7203599939, ОГРН 1257200016952)"),
    ("Контакты", "hello@lemnity.ru · Telegram @lemnity_ru · vk.com/lemnity"),
])

# ===== 1. Назначение =====
h2("1. Назначение модуля")
p("Программный модуль «Чат» предназначен для размещения на веб-сайте чат-виджета "
  "(онлайн-консультанта) и организации онлайн-общения с посетителями сайта. Модуль обеспечивает "
  "приём обращений, ведение диалогов операторами в реальном времени, распределение обращений "
  "и сбор статистики взаимодействия.")

# ===== 2. Функциональные характеристики =====
h2("2. Функциональные характеристики")
bullets([
    "Отображение чат-виджета на сайте и общение с посетителями в реальном времени;",
    "Управление операторами, обрабатывающими обращения;",
    "Создание отделов и распределение операторов по отделам;",
    "Настройка правил распределения входящих обращений между операторами;",
    "Настройка сценариев обработки обращений;",
    "Хранение истории переписки и групповые сообщения;",
    "Настройка внешнего вида виджета с предпросмотром для десктопной и мобильной версий;",
    "Интеграции с внешними каналами и социальными сетями;",
    "Сбор и просмотр статистики обращений (показы, открытия, действия).",
])

# ===== 3. Технические характеристики =====
h2("3. Технические характеристики")
kv_table([
    ("Тип", "Веб-сервис (SaaS); встраиваемый на сайт виджет"),
    ("Языки программирования", "TypeScript, JavaScript"),
    ("Технологии", "Node.js, NestJS (сервер); React (интерфейс и виджет)"),
    ("СУБД", "PostgreSQL; ClickHouse (аналитика)"),
    ("Очереди / хранилище", "RabbitMQ; MinIO (S3-совместимое)"),
    ("Среда развёртывания", "Docker; Nginx; ОС Linux (в т.ч. Astra Linux)"),
    ("Язык интерфейса", "Русский"),
], w0=55)

# ===== 4. Установка (подключение) =====
h2("4. Установка (подключение) модуля")
p("Модуль предоставляется по модели «программное обеспечение как услуга» (SaaS) и не требует "
  "установки на оборудование пользователя. Для использования модуля необходимо:")
steps([
    "Войти в веб-интерфейс ПО по адресу <font name='Mono'>https://app.lemnity.ru</font> "
    "с использованием учётной записи;",
    "Создать проект (сайт) и добавить в него виджет типа «Чат»;",
    "Настроить виджет (внешний вид, операторы, отделы, правила распределения) и сохранить его;",
    "Скопировать идентификатор виджета из его настроек;",
    "Встроить скрипт виджета в HTML-код страниц сайта перед закрывающим тегом "
    "<font name='Mono'>&lt;/body&gt;</font>:",
])
code_block(['<script src="https://app.lemnity.ru/embed.js?widgetId=<идентификатор-виджета>"></script>'])
p("После публикации страницы чат-виджет автоматически отображается на сайте.")
h3("Требования к рабочему месту")
bullets([
    "Современный веб-браузер (Google Chrome, Яндекс.Браузер, Mozilla Firefox актуальных версий);",
    "Доступ в сеть Интернет.",
])

# ===== 5. Эксплуатация =====
h2("5. Эксплуатация модуля")
h3("5.1. Настройка операторов и отделов")
bullets([
    "Добавление операторов, обрабатывающих обращения;",
    "Создание отделов и распределение операторов по отделам;",
    "Настройка правил распределения входящих обращений.",
])
h3("5.2. Обработка обращений")
bullets([
    "Поступающие обращения отображаются в интерфейсе оператора;",
    "Оператор ведёт переписку в реальном времени и имеет доступ к истории диалога;",
    "Поддерживается обработка обращений по заданным сценариям.",
])
h3("5.3. Аналитика")
p("В разделе аналитики доступны показатели взаимодействия с виджетом (показы, открытия, действия) "
  "в виде сводных значений и динамики за период с фильтрацией по периоду и типу события.")

# ===== 6. Поддержка =====
h2("6. Техническая поддержка")
kv_table([
    ("E-mail", "hello@lemnity.ru"),
    ("Telegram", "@lemnity_ru"),
    ("ВКонтакте", "vk.com/lemnity"),
    ("Режим работы", "Рабочие дни с 9:00 до 18:00 (время московское)"),
])

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Body", 8); canvas.setFillColor(GREY)
    canvas.drawString(20 * mm, 12 * mm, "Lemnity — Документация модуля «Чат»")
    canvas.drawRightString(190 * mm, 12 * mm, "стр. %d" % doc.page)
    canvas.setStrokeColor(BORDER); canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.restoreState()

doc = SimpleDocTemplate(
    "/Users/thesimakov/Documents/GitHub/lemnity/docs/reestr/Документация_модуля_Чат_Lemnity.pdf",
    pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
    title="Документация программного модуля «Чат» ПО Lemnity", author="ООО Лемнити")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("OK")
