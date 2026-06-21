#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""PDF «Справка об основаниях возникновения исключительного права» ООО Лемнити (реестр)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

pdfmetrics.registerFont(TTFont("Body", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("Body-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))

GREY = colors.HexColor("#444444")
DARK = colors.HexColor("#1a1a1a")

HEAD = ParagraphStyle("Head", fontName="Body", fontSize=10.5, leading=14, textColor=DARK)
TITLE = ParagraphStyle("Title", fontName="Body-Bold", fontSize=13.5, leading=18, alignment=TA_CENTER, textColor=DARK, spaceBefore=10, spaceAfter=4)
SUBT = ParagraphStyle("Subt", fontName="Body", fontSize=10.5, leading=14, alignment=TA_CENTER, textColor=GREY, spaceAfter=4)
BODY = ParagraphStyle("Body", fontName="Body", fontSize=11, leading=16, textColor=DARK, alignment=TA_JUSTIFY, spaceAfter=8, firstLineIndent=14)
SIGN = ParagraphStyle("Sign", fontName="Body", fontSize=11, leading=16, textColor=DARK)

story = []
def p(t): story.append(Paragraph(t, BODY))
def sp(h=6): story.append(Spacer(1, h))

# Шапка организации
story.append(Paragraph("ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ «ЛЕМНИТИ»", HEAD))
story.append(Paragraph("ИНН 7203599939 · ОГРН 1257200016952", HEAD))
story.append(Paragraph("Адрес: г. Тюмень, ул. Пышминская, 103", HEAD))
story.append(Paragraph("hello@lemnity.ru", HEAD))
sp(4)
story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#999999")))
sp(4)

# Реквизиты документа (справа — дата/номер)
story.append(Paragraph("Исх. № &lt;___&gt; от «&lt;__&gt;» &lt;________&gt; 2026 г.", ParagraphStyle(
    "doc", parent=HEAD, alignment=TA_RIGHT)))
sp(8)

story.append(Paragraph("СПРАВКА", TITLE))
story.append(Paragraph("об основаниях возникновения исключительного права на программное обеспечение", SUBT))
sp(10)

p("Настоящей справкой Общество с ограниченной ответственностью «Лемнити» (ИНН 7203599939, "
  "ОГРН 1257200016952) (далее — Общество) подтверждает, что Обществу принадлежит исключительное "
  "право на программное обеспечение «Lemnity» (далее — Программное обеспечение) в полном объёме, "
  "на территории всего мира и на весь срок действия исключительного права.")

p("Программное обеспечение создано работниками Общества в пределах установленных для них трудовых "
  "обязанностей (служебное произведение). В соответствии со статьёй 1295 Гражданского кодекса "
  "Российской Федерации исключительное право на служебное произведение принадлежит работодателю — "
  "Обществу.")

p("Создание Программного обеспечения осуществлялось работниками Общества на основании заключённых "
  "с ними трудовых договоров и в рамках выполнения трудовой функции; служебные задания на разработку "
  "выдавались Обществом как работодателем.")

p("Отчуждение (передача) исключительного права на Программное обеспечение третьим лицам, а равно "
  "предоставление исключительной лицензии, при которых Общество утратило бы исключительное право, "
  "не производились. Обременения и права третьих лиц, препятствующие включению сведений о "
  "Программном обеспечении в единый реестр российских программ для электронных вычислительных машин "
  "и баз данных, отсутствуют.")

p("Настоящая справка выдана для представления в Министерство цифрового развития, связи и массовых "
  "коммуникаций Российской Федерации в целях включения сведений о Программном обеспечении в единый "
  "реестр российских программ для электронных вычислительных машин и баз данных.")

sp(24)

# Блок подписи
story.append(Paragraph("Генеральный директор<br/>ООО «Лемнити»", SIGN))
sp(20)
story.append(Paragraph(
    "______________________ / Симаков А. В. /", SIGN))
sp(6)
story.append(Paragraph("М.П.", SIGN))

def build(canvas, doc):
    canvas.saveState()
    canvas.setFont("Body", 8); canvas.setFillColor(GREY)
    canvas.drawRightString(190 * mm, 12 * mm, "")
    canvas.restoreState()

doc = SimpleDocTemplate(
    "/Users/thesimakov/Documents/GitHub/lemnity/docs/reestr/Справка_об_основаниях_исключительного_права_Lemnity.pdf",
    pagesize=A4, leftMargin=22 * mm, rightMargin=22 * mm, topMargin=20 * mm, bottomMargin=20 * mm,
    title="Справка об основаниях возникновения исключительного права на ПО Lemnity",
    author="ООО Лемнити")
doc.build(story)
print("OK")
