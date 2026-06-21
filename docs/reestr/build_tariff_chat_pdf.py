#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF «Тарифная политика программного модуля Чат» ПО Lemnity (реестр)."""
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

NAVY = colors.HexColor("#1f3a93")
GREY = colors.HexColor("#444444")
LIGHT = colors.HexColor("#f2f4f8")
BORDER = colors.HexColor("#d0d7e2")

H1 = ParagraphStyle("H1", fontName="Body-Bold", fontSize=18, leading=23, textColor=NAVY, spaceAfter=4)
H2 = ParagraphStyle("H2", fontName="Body-Bold", fontSize=13.5, leading=18, textColor=NAVY, spaceBefore=15, spaceAfter=6)
BODY = ParagraphStyle("Body", fontName="Body", fontSize=10.5, leading=15, textColor=colors.HexColor("#1a1a1a"), alignment=TA_JUSTIFY, spaceAfter=5)
NOTE = ParagraphStyle("Note", parent=BODY, fontSize=9.8, textColor=GREY, leftIndent=8)
BULLET = ParagraphStyle("Bullet", parent=BODY, leftIndent=14, bulletIndent=2, spaceAfter=2)
CELL = ParagraphStyle("Cell", fontName="Body", fontSize=9.8, leading=13, textColor=colors.HexColor("#1a1a1a"))
CELL_B = ParagraphStyle("CellB", parent=CELL, fontName="Body-Bold")
CELL_R = ParagraphStyle("CellR", parent=CELL, alignment=2)

story = []
def h2(t): story.append(Paragraph(t, H2))
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

# ===== Титул =====
story.append(Paragraph("Тарифная политика программного модуля «Чат» программного обеспечения «Lemnity»", H1))
sp(2)
story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=8))
kv_table([
    ("Программное обеспечение", "Lemnity, версия 0.2.2"),
    ("Программный модуль", "Чат (онлайн-консультант)"),
    ("Правообладатель", "ООО «Лемнити» (ИНН 7203599939, ОГРН 1257200016952)"),
    ("Дата вступления в силу", "&lt;ДД.ММ.ГГГГ&gt;"),
])

# ===== 1 =====
h2("1. Общие положения")
p("Настоящая тарифная политика определяет порядок формирования стоимости использования программного "
  "модуля «Чат» программного обеспечения «Lemnity» (далее — Модуль). Модуль предоставляется по модели "
  "«программное обеспечение как услуга» (SaaS) на условиях возмездного лицензионного договора "
  "(подписки).")
p("Стоимость формируется в соответствии с настоящей тарифной политикой. Оплата производится "
  "периодическими платежами за расчётный период (календарный месяц). Все цены указаны в российских "
  "рублях; налогообложение — в соответствии с применяемым правообладателем налоговым режимом.")

# ===== 2 =====
h2("2. Тарифные позиции")
header = [Paragraph("№", CELL_B), Paragraph("Наименование тарифицируемой позиции", CELL_B),
          Paragraph("Единица", CELL_B), Paragraph("Стоимость, ₽", CELL_B)]
rows = [
    ["1", "Базовый тариф «Чат» (включает 1 оператора)", "1 месяц", "1 290"],
    ["2", "Дополнительный оператор", "1 оператор / 1 месяц", "490"],
]
data = [header] + [[Paragraph(r[0], CELL), Paragraph(r[1], CELL),
                    Paragraph(r[2], CELL), Paragraph(r[3], CELL_R)] for r in rows]
tbl = Table(data, colWidths=[10 * mm, 95 * mm, 35 * mm, 25 * mm], repeatRows=1)
tbl.setStyle(TableStyle([
    ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"),
    ("ALIGN", (3, 0), (3, -1), "RIGHT"),
    ("ALIGN", (0, 0), (0, -1), "CENTER"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
    ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(tbl); sp(6)

# ===== 3 =====
h2("3. Состав базового тарифа")
p("Базовый тариф «Чат» включает следующие возможности (без дополнительной оплаты):")
bullets([
    "Чат-виджет на сайте и общение с посетителями в реальном времени;",
    "1 оператор (рабочее место для обработки обращений);",
    "Бот-сценарий и сценарии обработки обращений;",
    "Отделы и распределение обращений между операторами;",
    "Омниканальность: подключение каналов Telegram, MAX, ВКонтакте;",
    "AI-агент (в пределах разумного использования — ориентировочно 1 000 ответов в месяц);",
    "Размещение на 1 сайте;",
    "Настройка внешнего вида и брендирование виджета.",
])

# ===== 4 =====
h2("4. Порядок расчёта стоимости")
p("Итоговая стоимость за расчётный период определяется как сумма базового тарифа и стоимости "
  "дополнительных операторов:")
note("Стоимость за месяц = 1 290 ₽ + 490 ₽ × (количество дополнительных операторов).")
p("Пример: команда из 3 операторов — 1 290 ₽ (база, 1 оператор) + 2 × 490 ₽ = <b>2 270 ₽ в месяц</b>.")

# ===== 5 =====
h2("5. Дополнительные условия")
bullets([
    "Стоимость может быть пересмотрена правообладателем; актуальная редакция тарифной политики "
    "публикуется на сайте правообладателя;",
    "Обслуживание модуля осуществляется при наличии действующей оплаты за расчётный период;",
    "Подробные условия предоставления и оплаты определяются лицензионным договором (офертой) "
    "правообладателя.",
])
kv_table([
    ("Сайт", "https://lemnity.ru"),
    ("E-mail", "hello@lemnity.ru"),
    ("Telegram / ВКонтакте", "@lemnity_ru&nbsp;&nbsp;·&nbsp;&nbsp;vk.com/lemnity"),
], w0=55)

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Body", 8); canvas.setFillColor(GREY)
    canvas.drawString(20 * mm, 12 * mm, "Lemnity — Тарифная политика модуля «Чат»")
    canvas.drawRightString(190 * mm, 12 * mm, "стр. %d" % doc.page)
    canvas.setStrokeColor(BORDER); canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.restoreState()

doc = SimpleDocTemplate(
    "/Users/thesimakov/Documents/GitHub/lemnity/docs/reestr/Тарифная_политика_модуля_Чат_Lemnity.pdf",
    pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
    title="Тарифная политика программного модуля «Чат» ПО Lemnity", author="ООО Лемнити")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("OK")
