#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF «Информация, необходимая для эксплуатации ПО Lemnity» (руководство) для реестра."""
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
story.append(Paragraph(
    "Руководство по эксплуатации экземпляра программного обеспечения «Lemnity»", H1))
sp(2)
story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=8))
p("<b>Назначение документа.</b> Настоящий документ содержит информацию, необходимую для "
  "эксплуатации экземпляра программного обеспечения «Lemnity» (далее — ПО), предоставленного для "
  "проведения экспертной проверки, и предназначен для пользователей и администраторов ПО.")
note("Поля в угловых скобках &lt;...&gt; заменяются фактическими значениями экземпляра, "
     "предоставленного для проверки.")

# ===== 1 =====
h2("1. Общие сведения")
p("ПО «Lemnity» — облачная платформа (веб-сервис) для создания, настройки и размещения на "
  "веб-сайтах интерактивных виджетов: маркетинговых и игровых механик, форм сбора заявок, "
  "обратного звонка и онлайн-чата. Работа с ПО осуществляется через веб-интерфейс в браузере; "
  "установка дополнительного программного обеспечения на рабочем месте не требуется.")

h3("Требования к рабочему месту")
bullets([
    "Современный веб-браузер (Google Chrome, Яндекс.Браузер, Mozilla Firefox актуальных версий);",
    "Доступ в сеть Интернет;",
    "Учётная запись пользователя в ПО.",
])

# ===== 2 =====
h2("2. Начало работы")
h3("2.1. Вход в систему")
steps([
    "Открыть в браузере адрес веб-интерфейса: <font name='Mono'>&lt;https://app.lemnity.ru&gt;</font>",
    "Ввести адрес электронной почты и пароль учётной записи;",
    "Нажать кнопку входа. После успешной аутентификации открывается рабочая область.",
])
h3("2.2. Восстановление пароля")
steps([
    "На странице входа выбрать «Забыли пароль?»;",
    "Указать адрес электронной почты, привязанный к учётной записи;",
    "Перейти по ссылке из полученного письма и задать новый пароль.",
])

# ===== 3 =====
h2("3. Управление проектами")
p("Проект соответствует сайту, на котором размещаются виджеты. Для начала работы создаётся проект:")
steps([
    "В рабочей области перейти в раздел проектов;",
    "Создать новый проект, указав его наименование;",
    "Открыть проект для дальнейшей настройки виджетов.",
])

# ===== 4 =====
h2("4. Создание и настройка виджета")
steps([
    "Открыть проект и перейти к каталогу виджетов;",
    "Выбрать тип виджета (например, «Чат», «Колесо фортуны», «Лид-форма» и др.);",
    "В визуальном редакторе настроить содержимое виджета (тексты, поля, призы, медиа);",
    "Настроить внешний вид с предпросмотром для десктопной и мобильной версий;",
    "Задать правила и условия показа виджета;",
    "Сохранить виджет — конфигурация проходит проверку и сохраняется.",
])
note("Каждому сохранённому виджету присваивается уникальный идентификатор, который используется "
     "при размещении виджета на сайте.")

# ===== 5 =====
h2("5. Размещение виджета на сайте")
p("Для отображения виджета на сайте необходимо встроить единый скрипт в HTML-код страниц сайта "
  "(перед закрывающим тегом <font name='Mono'>&lt;/body&gt;</font>):")
code_block(['<script src="https://app.lemnity.ru/embed.js?widgetId=<идентификатор-виджета>"></script>'])
p("Идентификатор виджета берётся из настроек соответствующего виджета в веб-интерфейсе. После "
  "публикации страницы виджет автоматически отображается на сайте.")

# ===== 6 =====
h2("6. Работа с онлайн-чатом")
h3("6.1. Настройка операторов и отделов")
bullets([
    "Добавление операторов, которые будут обрабатывать обращения;",
    "Создание отделов и распределение операторов по отделам;",
    "Настройка правил распределения входящих обращений между операторами.",
])
h3("6.2. Обработка обращений")
bullets([
    "Поступающие от посетителей сайта обращения отображаются в интерфейсе оператора;",
    "Оператор ведёт переписку в реальном времени, имеет доступ к истории диалога;",
    "Поддерживается настройка сценариев обработки обращений.",
])

# ===== 7 =====
h2("7. Заявки и обратный звонок")
bullets([
    "Заявки (лиды), оставленные посетителями через виджеты, сохраняются в системе с указанием "
    "статуса; их можно просматривать и обрабатывать;",
    "Заявки на обратный звонок принимаются и доступны для дальнейшей обработки.",
])

# ===== 8 =====
h2("8. Аналитика")
p("В разделе аналитики доступны показатели взаимодействия пользователей с виджетами: число "
  "показов, открытий и целевых действий. Данные представлены в виде сводных значений и динамики "
  "за период с возможностью фильтрации по виджету, проекту, типу события и времени.")

# ===== 9 =====
h2("9. Завершение работы")
p("Для завершения сеанса работы используется команда выхода из учётной записи в веб-интерфейсе. "
  "Специальных действий по остановке ПО со стороны пользователя не требуется — ПО функционирует "
  "как веб-сервис.")

# ===== 10 =====
h2("10. Действия при нештатных ситуациях")
kv_table([
    ("Не открывается веб-интерфейс",
     "Проверить подключение к сети Интернет и корректность адреса; повторить попытку позднее"),
    ("Не выполняется вход",
     "Проверить правильность логина и пароля; при необходимости восстановить пароль"),
    ("Виджет не отображается на сайте",
     "Проверить корректность встроенного скрипта и идентификатора виджета, активность виджета"),
    ("Иные неисправности",
     "Обратиться в службу технической поддержки: hello@lemnity.ru (Telegram: @lemnity_ru)"),
])

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Body", 8); canvas.setFillColor(GREY)
    canvas.drawString(20 * mm, 12 * mm, "Lemnity 0.2.2 — Руководство по эксплуатации")
    canvas.drawRightString(190 * mm, 12 * mm, "стр. %d" % doc.page)
    canvas.setStrokeColor(BORDER); canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.restoreState()

doc = SimpleDocTemplate(
    "/Users/thesimakov/Documents/GitHub/lemnity/docs/reestr/Руководство_по_эксплуатации_Lemnity.pdf",
    pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
    title="Руководство по эксплуатации ПО Lemnity", author="Lemnity")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("OK")
