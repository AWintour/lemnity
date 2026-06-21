#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Сборка PDF «Описание функциональных характеристик ПО Lemnity» для реестра."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
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

H1 = ParagraphStyle("H1", fontName="Body-Bold", fontSize=19, leading=24, textColor=NAVY, spaceAfter=4)
H2 = ParagraphStyle("H2", fontName="Body-Bold", fontSize=13.5, leading=18, textColor=NAVY, spaceBefore=15, spaceAfter=6)
H3 = ParagraphStyle("H3", fontName="Body-Bold", fontSize=11.5, leading=15, textColor=colors.HexColor("#2a2a2a"), spaceBefore=8, spaceAfter=3)
BODY = ParagraphStyle("Body", fontName="Body", fontSize=10.5, leading=15, textColor=colors.HexColor("#1a1a1a"), alignment=TA_JUSTIFY, spaceAfter=5)
NOTE = ParagraphStyle("Note", parent=BODY, fontSize=9.8, textColor=GREY, leftIndent=8)
BULLET = ParagraphStyle("Bullet", parent=BODY, leftIndent=14, bulletIndent=2, spaceAfter=2)
CELL = ParagraphStyle("Cell", fontName="Body", fontSize=9.6, leading=13, textColor=colors.HexColor("#1a1a1a"))
CELL_B = ParagraphStyle("CellB", parent=CELL, fontName="Body-Bold")

story = []
def h2(t): story.append(Paragraph(t, H2))
def h3(t): story.append(Paragraph(t, H3))
def p(t): story.append(Paragraph(t, BODY))
def note(t): story.append(Paragraph(t, NOTE))
def sp(h=6): story.append(Spacer(1, h))
def bullets(items):
    for it in items:
        story.append(Paragraph(it, BULLET, bulletText="•"))

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

def grid_table(header, rows):
    data = [[Paragraph(h, CELL_B) for h in header]] + \
           [[Paragraph(c, CELL) for c in r] for r in rows]
    tbl = Table(data, colWidths=[55 * mm, 110 * mm], repeatRows=1)
    tbl.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    # header font
    tbl.setStyle(TableStyle([("FONTNAME", (0, 0), (-1, 0), "Body-Bold")]))
    story.append(tbl); sp(6)

# ===== Титул =====
story.append(Paragraph("Описание функциональных характеристик экземпляра программного обеспечения «Lemnity»", H1))
sp(2)
story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=8))
p("<b>Назначение документа.</b> Настоящий документ содержит описание функциональных характеристик "
  "экземпляра программного обеспечения «Lemnity» (далее — ПО), предоставленного для проведения "
  "экспертной проверки в целях включения в единый реестр российских программ для ЭВМ и баз данных.")

# ===== 1. Общие сведения =====
h2("1. Общие сведения и назначение")
kv_table([
    ("Наименование ПО", "Lemnity"),
    ("Версия", "0.2.2"),
    ("Класс ПО", "Прикладное программное обеспечение. Средства создания и размещения "
                 "интерактивных веб-виджетов на сайтах, привлечения и обслуживания клиентов"),
    ("Тип ПО", "Веб-сервис (SaaS), серверное ПО с веб-интерфейсом"),
    ("Правообладатель", "ООО «Лемнити» (ИНН 7203599939, ОГРН 1257200016952)"),
])
p("<b>Назначение.</b> ПО «Lemnity» представляет собой облачную платформу (конструктор) для создания, "
  "настройки и размещения на веб-сайтах интерактивных виджетов, предназначенных для привлечения "
  "посетителей, повышения вовлечённости, сбора заявок (лидов) и онлайн-обслуживания клиентов. "
  "Виджеты подключаются к сайту встраиванием единого скрипта без доработки исходного кода сайта.")
p("<b>Область применения.</b> Маркетинг и онлайн-продажи, поддержка и обслуживание клиентов, "
  "проведение акций и геймификация, сбор обращений и заявок на сайтах организаций.")

# ===== 2. Функциональные возможности =====
h2("2. Функциональные возможности")

h3("2.1. Управление проектами и размещение виджетов")
bullets([
    "Создание и ведение проектов (сайтов), к которым привязываются виджеты;",
    "Подключение виджетов к сайту путём встраивания единого JavaScript-скрипта;",
    "Управление набором активных виджетов в рамках проекта.",
])

h3("2.2. Каталог виджетов")
p("ПО включает каталог из 15 типов виджетов, сгруппированных по направлениям: "
  "<b>Лиды</b>, <b>Вовлечение</b>, <b>Вознаграждение</b>:")
grid_table(["Группа", "Типы виджетов"], [
    ["Игровые и акционные (вознаграждение)",
     "Колесо фортуны, Конвейер Удачи, Конвейер подарков, Сундук с акцией, "
     "Advent-календарь, Открытка"],
    ["Вовлечение и информирование",
     "Анонс, Таймер событий, Уведомления, Дразнилка, Видео-виджет, Мультикнопка"],
    ["Лиды и коммуникации",
     "Лид-форма, Обратный звонок, Чат (онлайн-консультант)"],
])

h3("2.3. Визуальный редактор виджетов")
bullets([
    "Настройка содержимого виджета (тексты, поля формы, призы, медиа);",
    "Настройка внешнего вида с предпросмотром для десктопной и мобильной версий;",
    "Настройка правил и условий показа виджета;",
    "Настройка интеграций виджета; валидация и нормализация конфигурации перед сохранением.",
])

h3("2.4. Онлайн-чат (виджет «Чат»)")
bullets([
    "Ведение диалогов с посетителями сайта в реальном времени;",
    "Управление операторами и отделами, распределение обращений между операторами;",
    "Настройка правил распределения и сценариев обработки обращений;",
    "Групповые сообщения и история переписки;",
    "Интеграции с внешними каналами/социальными сетями.",
])

h3("2.5. Сбор заявок и обратный звонок")
bullets([
    "Приём и хранение заявок (лидов), полученных через виджеты, с указанием статуса и устройства;",
    "Оформление заявок на обратный звонок и управление подписками на звонок.",
])

h3("2.6. Аналитика и сбор событий")
bullets([
    "Сбор событий взаимодействия с виджетами (показы, открытия, действия пользователей) "
    "по защищённому каналу;",
    "Формирование отчётности: сводные показатели, временные ряды, выборка отдельных событий "
    "с фильтрацией по виджету, проекту, типу события, периоду и иным параметрам.",
])

h3("2.7. Управление пользователями и доступом")
bullets([
    "Регистрация и аутентификация пользователей (на основе JWT);",
    "Разграничение прав по ролям пользователей;",
    "Восстановление пароля по электронной почте.",
])

# ===== 3. Архитектура и состав =====
h2("3. Состав и архитектура")
p("ПО построено по модульной (микросервисной) архитектуре и состоит из следующих основных компонентов:")
grid_table(["Компонент", "Назначение"], [
    ["Веб-клиент", "Веб-интерфейс администратора: управление проектами, виджетами, чатом, аналитикой"],
    ["Сервер приложений (API)", "Бизнес-логика, хранение и валидация конфигураций виджетов, REST API"],
    ["Сервис сбора событий", "Приём событий виджетов и их передача в аналитическое хранилище"],
    ["Шлюз очередей", "Асинхронная передача событий и сообщений"],
    ["Встраиваемый скрипт", "Отображение виджетов на сайте клиента и отправка событий"],
])

# ===== 4. Технологии и требования =====
h2("4. Используемые технологии и системные требования")
kv_table([
    ("Языки программирования", "TypeScript, JavaScript"),
    ("Технологии", "Node.js, NestJS (сервер); React (веб-интерфейс)"),
    ("СУБД", "PostgreSQL (основные данные); ClickHouse (аналитика)"),
    ("Очереди сообщений", "RabbitMQ"),
    ("Объектное хранилище", "MinIO (S3-совместимое)"),
    ("Веб-сервер / прокси", "Nginx"),
    ("Среда развёртывания", "Docker / Docker Compose"),
    ("Операционная система", "Linux (в т.ч. Astra Linux)"),
], w0=55)
h3("Требования к рабочему месту пользователя")
bullets([
    "Современный веб-браузер (Google Chrome, Яндекс.Браузер, Mozilla Firefox актуальных версий);",
    "Доступ в сеть Интернет.",
])

# ===== 5. Языки интерфейса =====
h2("5. Язык интерфейса")
p("Язык пользовательского интерфейса — русский.")

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Body", 8); canvas.setFillColor(GREY)
    canvas.drawString(20 * mm, 12 * mm, "Lemnity 0.2.2 — Описание функциональных характеристик")
    canvas.drawRightString(190 * mm, 12 * mm, "стр. %d" % doc.page)
    canvas.setStrokeColor(BORDER); canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.restoreState()

doc = SimpleDocTemplate(
    "/Users/thesimakov/Documents/GitHub/lemnity/docs/reestr/Описание_функциональных_характеристик_Lemnity.pdf",
    pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
    title="Описание функциональных характеристик ПО Lemnity", author="Lemnity")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("OK")
