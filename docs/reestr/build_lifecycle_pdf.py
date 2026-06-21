#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF «Описание процессов поддержания жизненного цикла ПО Lemnity» для реестра."""
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

def grid_table(header, rows, c0=55):
    data = [[Paragraph(h, CELL_B) for h in header]] + \
           [[Paragraph(c, CELL) for c in r] for r in rows]
    tbl = Table(data, colWidths=[c0 * mm, (165 - c0) * mm], repeatRows=1)
    tbl.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Body-Bold"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(tbl); sp(6)

# ===== Титул =====
story.append(Paragraph(
    "Описание процессов, обеспечивающих поддержание жизненного цикла программного обеспечения «Lemnity», "
    "включая устранение неисправностей и совершенствование, и информация о персонале", H1))
sp(2)
story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=8))
p("<b>Назначение документа.</b> Настоящий документ описывает процессы, обеспечивающие поддержание "
  "жизненного цикла программного обеспечения «Lemnity» (далее — ПО), в том числе устранение "
  "неисправностей, выявленных в ходе эксплуатации, совершенствование ПО, а также содержит сведения "
  "о персонале, необходимом для обеспечения такой поддержки.")

# ===== 1 =====
h2("1. Общие сведения")
kv_table([
    ("Наименование ПО", "Lemnity"),
    ("Версия", "0.2.2"),
    ("Правообладатель", "ООО «Лемнити» (ИНН 7203599939, ОГРН 1257200016952)"),
    ("Способ поставки", "Веб-сервис (SaaS); поддержка осуществляется правообладателем"),
])
p("Поддержание жизненного цикла ПО осуществляется силами правообладателя в рамках непрерывного "
  "процесса разработки, тестирования, выпуска обновлений и технической поддержки пользователей.")

# ===== 2 =====
h2("2. Процессы поддержания жизненного цикла")

h3("2.1. Организация разработки")
bullets([
    "Исходный код ПО хранится в системе контроля версий Git в едином репозитории (монорепозиторий);",
    "Изменения вносятся в отдельных ветках с последующим код-ревью перед включением в основную ветку;",
    "Применяются автоматические проверки качества кода (линтинг, форматирование, проверка типов).",
])

h3("2.2. Сборка и выпуск версий")
bullets([
    "Сборка компонентов выполняется автоматизированно в виде образов контейнеров Docker;",
    "Готовые образы публикуются в реестре контейнеров и версионируются по тегам;",
    "Выпуск (развёртывание) новой версии в продуктивную среду выполняется скриптом "
    "развёртывания (<font name='Mono'>deploy.sh</font>) с автоматическим обновлением сервисов "
    "и синхронизацией схемы базы данных.",
])

h3("2.3. Тестирование")
bullets([
    "Перед выпуском проводится функциональное тестирование изменений;",
    "Проверяется корректность работы виджетов, сохранения и отдачи конфигураций, сбора аналитики;",
    "Изменения схемы базы данных применяются управляемо (миграции/синхронизация схемы).",
])

h3("2.4. Эксплуатация и мониторинг")
bullets([
    "Контроль состояния сервисов осуществляется по статусам работоспособности контейнеров "
    "(health-check) и журналам работы;",
    "Выполняется резервное копирование базы данных;",
    "При необходимости производится горизонтальное и вертикальное масштабирование сервисов.",
])

# ===== 3 =====
h2("3. Устранение неисправностей")
p("Устранение неисправностей выполняется в рамках процесса технической поддержки в следующем порядке:")
grid_table(["Этап", "Содержание"], [
    ["1. Регистрация обращения",
     "Приём обращения пользователя по каналам поддержки, фиксация описания неисправности"],
    ["2. Диагностика",
     "Воспроизведение проблемы, анализ журналов работы сервисов, определение причины"],
    ["3. Классификация",
     "Оценка критичности и приоритета (блокирующая / существенная / несущественная)"],
    ["4. Устранение",
     "Внесение исправления в исходный код, прохождение код-ревью и тестирования"],
    ["5. Выпуск исправления",
     "Сборка и развёртывание обновлённой версии в продуктивную среду"],
    ["6. Уведомление",
     "Информирование пользователя об устранении неисправности"],
])
note("Поскольку ПО поставляется как веб-сервис, исправления применяются централизованно "
     "на стороне правообладателя и становятся доступны всем пользователям без действий с их стороны.")

# ===== 4 =====
h2("4. Совершенствование ПО")
bullets([
    "Развитие ПО ведётся итеративно: планирование, реализация, тестирование и выпуск новых версий;",
    "Источники требований к развитию — обращения и пожелания пользователей, анализ эксплуатации, "
    "развитие рынка и технологий;",
    "Совершенствование включает добавление новых типов виджетов и возможностей, улучшение "
    "пользовательского интерфейса, повышение производительности и надёжности;",
    "Новые версии выпускаются по мере готовности; пользователи веб-сервиса получают обновления "
    "автоматически.",
])

# ===== 5 =====
h2("5. Техническая поддержка пользователей")
kv_table([
    ("Канал поддержки", "Электронная почта: hello@lemnity.ru"),
    ("Дополнительные каналы", "Telegram: @lemnity_ru; ВКонтакте: vk.com/lemnity"),
    ("Режим работы", "Рабочие дни с 9:00 до 18:00 (время московское)"),
    ("Адрес сайта", "https://lemnity.ru"),
])
p("В рамках технической поддержки оказывается консультирование по работе с ПО, приём и обработка "
  "обращений о неисправностях, помощь в настройке и подключении виджетов.")

# ===== 6 =====
h2("6. Персонал, необходимый для поддержки")
p("Для поддержания жизненного цикла ПО и оказания технической поддержки привлекается персонал "
  "следующей квалификации:")
grid_table(["Роль", "Функции и требуемая квалификация"], [
    ["Руководитель / менеджер продукта",
     "Планирование развития ПО, приоритизация задач, взаимодействие с пользователями"],
    ["Разработчик (back-end)",
     "Разработка и сопровождение серверной части. Знание TypeScript, Node.js, NestJS, "
     "PostgreSQL, Docker"],
    ["Разработчик (front-end)",
     "Разработка и сопровождение веб-интерфейса и встраиваемых виджетов. Знание TypeScript, React"],
    ["Инженер по эксплуатации (DevOps)",
     "Развёртывание, мониторинг, резервное копирование, сопровождение инфраструктуры. "
     "Знание Docker, Nginx, Linux, CI/CD"],
    ["Специалист технической поддержки",
     "Приём и обработка обращений пользователей, первичная диагностика, консультирование"],
])
note("Допускается совмещение нескольких ролей одним специалистом. Минимально необходимый состав "
     "для поддержания жизненного цикла ПО — не менее одного разработчика и одного специалиста, "
     "обеспечивающего эксплуатацию и поддержку.")

# ===== 7 =====
h2("7. Контактная информация")
kv_table([
    ("Правообладатель", "ООО «Лемнити» (ИНН 7203599939, ОГРН 1257200016952)"),
    ("Адрес", "г. Тюмень, ул. Пышминская, 103"),
    ("E-mail", "hello@lemnity.ru"),
    ("Telegram / ВКонтакте", "@lemnity_ru&nbsp;&nbsp;·&nbsp;&nbsp;vk.com/lemnity"),
])

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Body", 8); canvas.setFillColor(GREY)
    canvas.drawString(20 * mm, 12 * mm, "Lemnity 0.2.2 — Поддержание жизненного цикла ПО")
    canvas.drawRightString(190 * mm, 12 * mm, "стр. %d" % doc.page)
    canvas.setStrokeColor(BORDER); canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.restoreState()

doc = SimpleDocTemplate(
    "/Users/thesimakov/Documents/GitHub/lemnity/docs/reestr/Поддержание_жизненного_цикла_Lemnity.pdf",
    pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
    title="Описание процессов поддержания жизненного цикла ПО Lemnity", author="Lemnity")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("OK")
