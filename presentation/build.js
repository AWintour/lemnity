/* Lemnity «Чат» — client presentation. Platform style (purple #5951E5, Rubik). */
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const Fa = require("react-icons/fa");

const LOGODIR = "/Users/thesimakov/Documents/GitHub/lemnity/projects/client/src/assets/logos";
const OUT = __dirname;
const ASSETS = path.join(OUT, "assets");
if (!fs.existsSync(ASSETS)) fs.mkdirSync(ASSETS);

/* ---------- palette (real platform tokens) ---------- */
const C = {
  purple: "5951E5",
  purpleDeep: "2A1F8F",
  purpleNight: "171232",
  lilac: "9244FB",
  ink: "1A1A1A",
  gray: "4B4754",
  grayLt: "8B8794",
  bubbleOp: "F4F2FC",
  bg: "F7F7F9",
  white: "FFFFFF",
  green: "3BD16F",
  red: "FF4646",
  border: "EDEDF0",
  cardLine: "ECEAF6",
  teal: "6CD3C0",
  pink: "ED5BB0",
  amber: "F2A33C",
};
const FONT = "Rubik";
const makeShadow = (o = {}) => ({ type: "outer", color: "2A1F8F", blur: 14, offset: 5, angle: 90, opacity: 0.13, ...o });
const softShadow = () => ({ type: "outer", color: "1A1A1A", blur: 10, offset: 3, angle: 90, opacity: 0.10 });

/* ---------- icon rasterizer ---------- */
const iconCache = {};
async function icon(name, color = "FFFFFF", size = 256) {
  const key = name + color;
  if (iconCache[key]) return iconCache[key];
  const Comp = Fa[name];
  if (!Comp) throw new Error("no icon " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const data = "image/png;base64," + png.toString("base64");
  iconCache[key] = data;
  return data;
}

/* ---------- logo prep ---------- */
async function prepLogos() {
  const colored = path.join(ASSETS, "logo-color.png");
  const white = path.join(ASSETS, "logo-white.png");
  await sharp(path.join(LOGODIR, "lemnity-logo.svg"), { density: 600 }).resize({ height: 320 }).png().toFile(colored);
  let blackSvg = fs.readFileSync(path.join(LOGODIR, "lemnity-black-logo.svg"), "utf8").replace(/fill="black"/g, 'fill="#FFFFFF"');
  await sharp(Buffer.from(blackSvg), { density: 600 }).resize({ height: 320 }).png().toFile(white);
  return { colored, white };
}

const PAGE_W = 13.333, PAGE_H = 7.5, M = 0.65;

(async () => {
  const logos = await prepLogos();
  const pres = new pptxgen();
  pres.defineLayout({ name: "W", width: PAGE_W, height: PAGE_H });
  pres.layout = "W";
  pres.author = "Lemnity";
  pres.title = "Виджет «Чат» — Lemnity";

  /* preload icons */
  const I = {};
  const need = [
    ["FaComments", "FFFFFF"], ["FaComments", "5951E5"],
    ["FaCheck", "FFFFFF"], ["FaPaperPlane", "FFFFFF"], ["FaPlus", "FFFFFF"],
    ["FaUser", "5951E5"], ["FaBolt", "5951E5"], ["FaPalette", "5951E5"],
    ["FaRobot", "5951E5"], ["FaRegClock", "5951E5"], ["FaUserPlus", "5951E5"],
    ["FaMoon", "5951E5"], ["FaImage", "5951E5"], ["FaMapMarkerAlt", "5951E5"],
    ["FaMobileAlt", "5951E5"], ["FaDesktop", "5951E5"], ["FaCode", "5951E5"],
    ["FaCheckCircle", "5951E5"], ["FaPuzzlePiece", "5951E5"], ["FaLayerGroup", "5951E5"],
    ["FaArrowRight", "FFFFFF"], ["FaArrowRight", "5951E5"], ["FaRubleSign", "FFFFFF"],
    ["FaEye", "5951E5"], ["FaPencilAlt", "5951E5"], ["FaHeart", "5951E5"],
    ["FaCheck", "5951E5"], ["FaTimes", "5951E5"], ["FaPlus", "5951E5"],
    ["FaComments", "6CD3C0"], ["FaComments", "ED5BB0"], ["FaUser", "FFFFFF"],
    ["FaShoppingCart", "5951E5"], ["FaClock", "5951E5"],
  ];
  for (const [n, c] of need) I[n + c] = await icon(n, c);

  /* ===== shared helpers ===== */
  function bg(slide, color) { slide.background = { color }; }

  function kicker(slide, text, x = M, y = 0.62) {
    const len = text.length;
    const pillW = 0.5 + len * 0.115;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: pillW, h: 0.38, rectRadius: 0.19,
      fill: { color: C.bubbleOp }, line: { type: "none" },
    });
    slide.addShape(pres.shapes.OVAL, { x: x + 0.18, y: y + 0.14, w: 0.1, h: 0.1, fill: { color: C.purple } });
    slide.addText(text.toUpperCase(), {
      x: x + 0.34, y, w: pillW - 0.4, h: 0.38, align: "left", valign: "middle",
      fontFace: FONT, fontSize: 10.5, bold: true, charSpacing: 1,
      color: C.purpleDeep, margin: 0,
    });
  }

  function title(slide, lines, opts = {}) {
    const { x = M, y = 1.12, w = 8.2, color = C.ink, size = 38 } = opts;
    slide.addText(Array.isArray(lines) ? lines.map((t, i) => ({ text: t, options: { breakLine: i < lines.length - 1 } })) : lines, {
      x, y, w, h: 1.5, fontFace: FONT, fontSize: size, bold: true, color, lineSpacingMultiple: 1.0, align: "left", margin: 0,
    });
  }

  function footer(slide, n, total = 10, onDark = false) {
    const col = onDark ? "FFFFFF" : C.grayLt;
    slide.addImage({ path: onDark ? logos.white : logos.colored, x: M, y: PAGE_H - 0.52, h: 0.22, w: 0.22 * (230 / 51) });
    slide.addText(`${String(n).padStart(2, "0")} · ${total}`, {
      x: PAGE_W - M - 1.2, y: PAGE_H - 0.56, w: 1.2, h: 0.3, align: "right", valign: "middle",
      fontFace: FONT, fontSize: 10, color: col, bold: true, charSpacing: 1, transparency: onDark ? 35 : 0, margin: 0,
    });
  }

  function card(slide, x, y, w, h, opts = {}) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.14,
      fill: { color: opts.fill || C.white },
      line: opts.line === false ? { type: "none" } : { color: opts.lineColor || C.cardLine, width: 1 },
      shadow: opts.shadow === false ? undefined : makeShadow({ opacity: 0.08, blur: 12, offset: 4 }),
    });
  }

  // icon in rounded tile
  function iconTile(slide, x, y, s, iconKey, tileColor = C.bubbleOp) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: s, h: s, rectRadius: 0.1, fill: { color: tileColor }, line: { type: "none" } });
    slide.addImage({ data: I[iconKey], x: x + s * 0.27, y: y + s * 0.27, w: s * 0.46, h: s * 0.46 });
  }

  /* ===== chat widget mock (faithful recreation) ===== */
  function chatMock(slide, X, Y, W, accent, opts = {}) {
    const H = W * 1.44;
    const p = W * 0.05;
    // window
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y: Y, w: W, h: H, rectRadius: 0.13, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: makeShadow({ blur: 22, offset: 8, opacity: 0.18 }) });
    // body bg
    slide.addShape(pres.shapes.RECTANGLE, { x: X + 0.04, y: Y + 0.9 * (W / 3), w: W - 0.08, h: H - 0.9 * (W / 3) - 0.62, fill: { color: "FAFAFB" }, line: { type: "none" } });
    // header
    const hh = 0.78 * (W / 3);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X + p, y: Y + p, w: W - 2 * p, h: hh, rectRadius: 0.1, fill: { color: accent }, line: { type: "none" } });
    const ax = X + p + 0.13, ay = Y + p + (hh - 0.42) / 2;
    slide.addShape(pres.shapes.OVAL, { x: ax, y: ay, w: 0.42, h: 0.42, fill: { color: "FFFFFF" }, line: { color: "FFFFFF", width: 2 } });
    slide.addImage({ data: I["FaUser5951E5"], x: ax + 0.11, y: ay + 0.1, w: 0.2, h: 0.2 });
    slide.addText(opts.name || "Анна · поддержка", { x: ax + 0.54, y: Y + p + 0.1, w: W - 2 * p - 0.7, h: 0.26, fontFace: FONT, fontSize: 11, bold: true, color: "FFFFFF", margin: 0, valign: "middle" });
    slide.addShape(pres.shapes.OVAL, { x: ax + 0.55, y: Y + p + 0.42, w: 0.09, h: 0.09, fill: { color: C.green }, line: { color: "FFFFFF", width: 1 } });
    slide.addText("на связи сейчас", { x: ax + 0.7, y: Y + p + 0.36, w: 2, h: 0.22, fontFace: FONT, fontSize: 8.5, color: "FFFFFF", margin: 0, valign: "middle", transparency: 12 });

    // bubbles
    const bx = X + p + 0.05;
    let by = Y + hh + p + 0.18;
    const opW = W * 0.62, viW = W * 0.6;
    function bubble(text, mine) {
      const w = mine ? viW : opW;
      const x = mine ? X + W - p - 0.05 - w : bx;
      const h = 0.1 + Math.ceil(text.length / 22) * 0.22 + 0.12;
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: by, w, h, rectRadius: 0.09, fill: { color: mine ? accent : C.bubbleOp }, line: { type: "none" } });
      slide.addText(text, { x: x + 0.12, y: by, w: w - 0.24, h, fontFace: FONT, fontSize: 9.5, color: mine ? "FFFFFF" : C.ink, valign: "middle", margin: 0, lineSpacingMultiple: 0.95 });
      by += h + 0.12;
    }
    (opts.msgs || [["Здравствуйте! Чем можем помочь? 🙂", false], ["Подскажите, есть ли доставка?", true], ["Да, привезём уже завтра до обеда", false]]).forEach(m => bubble(m[0], m[1]));

    // composer
    const cy = Y + H - 0.5;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X + p, y: cy, w: W - 2 * p - 0.5, h: 0.36, rectRadius: 0.18, fill: { color: "F1F1F4" }, line: { type: "none" } });
    slide.addText("Напишите сообщение…", { x: X + p + 0.14, y: cy, w: W - 2 * p - 0.7, h: 0.36, fontFace: FONT, fontSize: 8.5, color: "B6B3BE", valign: "middle", margin: 0 });
    slide.addShape(pres.shapes.OVAL, { x: X + W - p - 0.42, y: cy - 0.01, w: 0.38, h: 0.38, fill: { color: accent }, line: { type: "none" } });
    slide.addImage({ data: I["FaPaperPlaneFFFFFF"], x: X + W - p - 0.32, y: cy + 0.1, w: 0.18, h: 0.18 });

    // launcher
    if (opts.launcher !== false) {
      const lx = X + W - 0.34, ly = Y + H - 0.16;
      slide.addShape(pres.shapes.OVAL, { x: lx, y: ly, w: 0.62, h: 0.62, fill: { color: accent }, line: { color: "FFFFFF", width: 2 }, shadow: makeShadow({ blur: 10, offset: 4, opacity: 0.25 }) });
      slide.addImage({ data: I["FaCommentsFFFFFF"], x: lx + 0.17, y: ly + 0.18, w: 0.28, h: 0.26 });
      slide.addShape(pres.shapes.OVAL, { x: lx + 0.45, y: ly - 0.03, w: 0.22, h: 0.22, fill: { color: C.red }, line: { color: "FFFFFF", width: 1.5 } });
      slide.addText("3", { x: lx + 0.45, y: ly - 0.04, w: 0.22, h: 0.22, align: "center", valign: "middle", fontFace: FONT, fontSize: 9, bold: true, color: "FFFFFF", margin: 0 });
    }
  }

  /* feature card with icon */
  function featCard(slide, x, y, w, h, iconKey, head, body) {
    card(slide, x, y, w, h);
    iconTile(slide, x + 0.28, y + 0.28, 0.62, iconKey);
    slide.addText(head, { x: x + 0.28, y: y + 1.0, w: w - 0.56, h: 0.5, fontFace: FONT, fontSize: 15, bold: true, color: C.ink, margin: 0 });
    slide.addText(body, { x: x + 0.28, y: y + 1.0 + 0.5, w: w - 0.56, h: h - 1.6, fontFace: FONT, fontSize: 11.5, color: C.gray, margin: 0, lineSpacingMultiple: 1.05, valign: "top" });
  }

  /* check-list row */
  function checkRow(slide, x, y, w, boldText, rest) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 0.42, h: 0.42, rectRadius: 0.1, fill: { color: C.purple }, line: { type: "none" } });
    slide.addImage({ data: I["FaCheckFFFFFF"], x: x + 0.12, y: y + 0.12, w: 0.18, h: 0.18 });
    slide.addText([{ text: boldText, options: { bold: true, color: C.ink } }, { text: rest, options: { color: C.gray } }], {
      x: x + 0.58, y: y - 0.04, w: w - 0.58, h: 0.52, fontFace: FONT, fontSize: 13.5, valign: "middle", margin: 0, lineSpacingMultiple: 1.0,
    });
  }

  /* ============================================================ 1. COVER */
  let s = pres.addSlide();
  bg(s, C.purpleNight);
  // glow blobs
  s.addShape(pres.shapes.OVAL, { x: -1.5, y: -2, w: 6, h: 6, fill: { color: C.purple, transparency: 72 }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: 9.5, y: 4, w: 6, h: 6, fill: { color: C.lilac, transparency: 80 }, line: { type: "none" } });
  s.addImage({ path: logos.white, x: M, y: 0.6, h: 0.42, w: 0.42 * (230 / 51) });
  // kicker
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 2.35, w: 2.55, h: 0.42, rectRadius: 0.21, fill: { color: "FFFFFF", transparency: 88 }, line: { color: "FFFFFF", width: 1, transparency: 70 } });
  s.addText("ВИДЖЕТ «ЧАТ»", { x: M + 0.05, y: 2.35, w: 2.5, h: 0.42, align: "center", valign: "middle", fontFace: FONT, fontSize: 12, bold: true, color: "FFFFFF", charSpacing: 2, margin: 0 });
  s.addText([{ text: "Живой чат для", options: { breakLine: true } }, { text: "вашего сайта", options: {} }], { x: M, y: 2.95, w: 7.4, h: 2.0, fontFace: FONT, fontSize: 56, bold: true, color: "FFFFFF", lineSpacingMultiple: 0.98, margin: 0 });
  s.addText("Посетитель пишет вам прямо на странице — как в мессенджере. А вы отвечаете и превращаете гостей в клиентов.", { x: M, y: 4.95, w: 6.6, h: 1.2, fontFace: FONT, fontSize: 16, color: "FFFFFF", transparency: 18, lineSpacingMultiple: 1.15, margin: 0 });
  chatMock(s, 9.0, 1.25, 3.1, C.purple, {});
  s.addText("lemnity.ru", { x: M, y: PAGE_H - 0.55, w: 3, h: 0.3, fontFace: FONT, fontSize: 11, color: "FFFFFF", transparency: 40, bold: true, margin: 0 });

  /* ============================================================ 2. WHAT IS IT */
  s = pres.addSlide(); bg(s, C.white);
  kicker(s, "Что это такое");
  title(s, ["Как живой продавец —", "только прямо на сайте"]);
  s.addText("Гость зашёл на сайт, и у него вопрос. Вместо того чтобы уйти — он нажимает кнопку и сразу пишет вам.", { x: M, y: 2.55, w: 7.2, h: 0.8, fontFace: FONT, fontSize: 14.5, color: C.gray, lineSpacingMultiple: 1.15, margin: 0 });
  const steps = [
    ["FaEye5951E5", "Видит кнопку", "Аккуратный значок в углу страницы. Заметный, но не мешает."],
    ["FaPencilAlt5951E5", "Пишет вопрос", "Привычно, как в WhatsApp или Telegram. Учиться не нужно."],
    ["FaBolt5951E5", "Получает ответ", "Вы отвечаете сразу — гость доволен и остаётся с вами."],
  ];
  const cw = (PAGE_W - 2 * M - 2 * 0.4) / 3;
  steps.forEach((st, i) => {
    const x = M + i * (cw + 0.4);
    featCard(s, x, 3.7, cw, 2.05, st[0], st[1], st[2]);
    // step number badge
    s.addShape(pres.shapes.OVAL, { x: x + cw - 0.66, y: 3.7 + 0.3, w: 0.42, h: 0.42, fill: { color: C.bubbleOp }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + cw - 0.66, y: 3.7 + 0.3, w: 0.42, h: 0.42, align: "center", valign: "middle", fontFace: FONT, fontSize: 15, bold: true, color: C.purple, margin: 0 });
  });
  footer(s, 2);

  /* ============================================================ 3. WHY / BENEFITS */
  s = pres.addSlide(); bg(s, C.bg);
  kicker(s, "Зачем это нужно");
  title(s, ["Больше клиентов.", "Больше продаж."]);
  s.addText("Люди не любят звонить и писать письма. А чат — это легко. Поэтому вопросов задают больше, а значит, и покупок больше.", { x: M, y: 2.5, w: 5.3, h: 1.6, fontFace: FONT, fontSize: 14.5, color: C.gray, lineSpacingMultiple: 1.2, margin: 0 });
  // big stat callout
  card(s, M, 4.25, 5.3, 2.3, { fill: C.purple, line: false });
  s.addText("×3", { x: M + 0.3, y: 4.42, w: 2, h: 0.95, fontFace: FONT, fontSize: 50, bold: true, color: "FFFFFF", margin: 0 });
  s.addText([{ text: "больше обращений", options: { bold: true, breakLine: true, color: "FFFFFF" } }, { text: "по сравнению с формой обратной связи", options: { color: "FFFFFF" } }], { x: M + 0.3, y: 5.35, w: 4.7, h: 0.9, fontFace: FONT, fontSize: 13, transparency: 12, margin: 0, lineSpacingMultiple: 1.05 });
  // right column checklist
  const rx = 6.5, rwt = PAGE_W - M - rx;
  const rows = [
    ["Клиент не уходит с вопросом. ", "Получил ответ — остался у вас."],
    ["Удобно, как мессенджер. ", "Знакомо каждому, осваивать не нужно."],
    ["Вы собираете контакты. ", "Имя, телефон, почту — для будущих продаж."],
    ["Работает и ночью. ", "Вас нет — чат примет сообщение, вы перезвоните."],
  ];
  rows.forEach((r, i) => checkRow(s, rx, 2.35 + i * 1.07, rwt, r[0], r[1]));
  footer(s, 3);

  /* ============================================================ 4. WHAT VISITOR SEES */
  s = pres.addSlide(); bg(s, C.white);
  kicker(s, "Что видит ваш клиент");
  title(s, ["Просто и приятно"]);
  chatMock(s, 9.35, 1.0, 3.3, C.purple, { name: "Магазин «Уют»", msgs: [["Добрый день! 👋", false], ["Хочу диван, как на фото", true], ["Отличный выбор! Есть в наличии", false], ["Запишу вас на доставку 🚚", false]], launcher: false });
  const vrows = [
    ["FaCommentsFFFFFF", "Пишет — и сразу видит ответ", "Переписка в реальном времени, без перезагрузок."],
    ["FaImage5951E5", "Прикрепляет фото и файлы", "Покажет, что именно ищет, одним вложением."],
    ["FaCheckCircle5951E5", "Видит, что вы на связи", "Зелёный кружок — значит, ответят прямо сейчас."],
    ["FaHeart5951E5", "Общается по-человечески", "Смайлики, имя оператора, живой диалог."],
  ];
  vrows.forEach((r, i) => {
    const y = 2.35 + i * 1.08;
    iconTile(s, M, y, 0.6, r[0].includes("FFFFFF") ? "FaComments5951E5" : r[0], C.bubbleOp);
    slideRow(s, M, y, r[1], r[2]);
  });
  function slideRow(sl, x, y, h, b) {
    sl.addText(h, { x: x + 0.82, y: y - 0.05, w: 7.4, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.ink, margin: 0, valign: "middle" });
    sl.addText(b, { x: x + 0.82, y: y + 0.34, w: 7.6, h: 0.4, fontFace: FONT, fontSize: 12, color: C.gray, margin: 0, valign: "middle" });
  }
  footer(s, 4);

  /* ============================================================ 5. OPERATOR FEATURES */
  s = pres.addSlide(); bg(s, C.bg);
  kicker(s, "Что можете вы");
  title(s, ["Отвечайте откуда удобно"]);
  const ops = [
    ["FaMobileAlt5951E5", "С телефона и компьютера", "Из офиса или на прогулке — отвечайте так, как вам удобнее."],
    ["FaImage5951E5", "Фото, видео и файлы", "До 10 вложений в одном сообщении — покажите товар «вживую»."],
    ["FaMapMarkerAlt5951E5", "Видите, кто пришёл", "Откуда клиент, с какого устройства и какая страница его привела."],
    ["FaCheckCircle5951E5", "Завершаете диалог", "Помогли — закрыли беседу одной кнопкой. Всё под контролем."],
  ];
  const gw = (PAGE_W - 2 * M - 0.4) / 2, gh = 1.66;
  ops.forEach((o, i) => {
    const x = M + (i % 2) * (gw + 0.4);
    const y = 2.35 + Math.floor(i / 2) * (gh + 0.36);
    card(s, x, y, gw, gh);
    iconTile(s, x + 0.3, y + 0.32, 0.62, o[0]);
    s.addText(o[1], { x: x + 1.12, y: y + 0.3, w: gw - 1.4, h: 0.45, fontFace: FONT, fontSize: 15.5, bold: true, color: C.ink, margin: 0, valign: "middle" });
    s.addText(o[2], { x: x + 1.12, y: y + 0.78, w: gw - 1.4, h: 0.7, fontFace: FONT, fontSize: 12, color: C.gray, margin: 0, lineSpacingMultiple: 1.1 });
  });
  footer(s, 5);

  /* ============================================================ 6. CUSTOMIZATION */
  s = pres.addSlide(); bg(s, C.white);
  kicker(s, "Сделайте его своим");
  title(s, ["Под стиль", "вашего бренда"], { w: 6.4, size: 34 });
  s.addText("Чат подстроится под ваш сайт: выберите цвет, добавьте логотип и имя сотрудника — клиент сразу поймёт, что общается именно с вами.", { x: M, y: 2.85, w: 6.2, h: 1.0, fontFace: FONT, fontSize: 13.5, color: C.gray, lineSpacingMultiple: 1.15, margin: 0 });
  // color presets row (real palette)
  s.addText("Цвет окна и кнопки:", { x: M, y: 3.95, w: 5, h: 0.3, fontFace: FONT, fontSize: 12, bold: true, color: C.ink, margin: 0 });
  const presets = ["5951E5", "E24B2E", "F2A33C", "74C56E", "6CD3C0", "5BA8F5", "ED5BB0"];
  presets.forEach((p, i) => {
    s.addShape(pres.shapes.OVAL, { x: M + i * 0.62, y: 4.3, w: 0.46, h: 0.46, fill: { color: p }, line: { color: i === 0 ? C.ink : "FFFFFF", width: i === 0 ? 2 : 1 } });
  });
  const crows = [["FaPalette5951E5", "Любой цвет", "окна и кнопки"], ["FaLayerGroup5951E5", "Ваш логотип", "и название компании"], ["FaUser5951E5", "Имя и фото", "сотрудника в шапке"]];
  crows.forEach((r, i) => {
    const y = 5.05 + i * 0.6;
    iconTile(s, M, y, 0.46, r[0], C.bubbleOp);
    s.addText([{ text: r[1] + " ", options: { bold: true, color: C.ink } }, { text: r[2], options: { color: C.gray } }], { x: M + 0.62, y: y - 0.05, w: 5, h: 0.56, fontFace: FONT, fontSize: 13, valign: "middle", margin: 0 });
  });
  // two recolored mocks
  chatMock(s, 7.8, 1.3, 2.5, C.teal, { name: "Кофейня «Зерно»", msgs: [["Доброе утро! ☕", false], ["Сварите латте?", true], ["Уже готовим 🙂", false]], launcher: false });
  chatMock(s, 10.5, 1.9, 2.5, C.pink, { name: "Студия «Лотос»", msgs: [["Здравствуйте! 🌸", false], ["Запись на маникюр?", true], ["Да, на завтра!", false]], launcher: false });
  footer(s, 6);

  /* ============================================================ 7. SMART FEATURES */
  s = pres.addSlide(); bg(s, C.bg);
  kicker(s, "Умные функции");
  title(s, ["Чат работает за вас"]);
  const smart = [
    ["FaClock5951E5", "Открывается сам", "Через несколько секунд или когда гость листает страницу — вежливо предложит помощь."],
    ["FaUserPlus5951E5", "Собирает контакты", "Спросит имя, телефон и почту, чтобы вы могли перезвонить."],
    ["FaMoon5951E5", "Не теряет сообщения", "Вас нет на месте? Клиент оставит сообщение — ответите утром."],
    ["FaRobot5951E5", "ИИ-помощник", "Скоро: умный помощник ответит на простые вопросы сам, пока вы заняты."],
  ];
  const sw = (PAGE_W - 2 * M - 3 * 0.36) / 4;
  smart.forEach((f, i) => {
    const x = M + i * (sw + 0.36);
    featCard(s, x, 2.55, sw, 2.7, f[0], f[1], f[2]);
  });
  footer(s, 7);

  /* ============================================================ 8. INSTALL */
  s = pres.addSlide(); bg(s, C.white);
  kicker(s, "Установка за 1 минуту");
  title(s, ["Не нужно быть", "программистом"]);
  const ist = [
    ["1", "Копируете строчку", "Мы даём готовый «код для вставки» — одну короткую строку. Нажимаете «Копировать»."],
    ["2", "Вставляете на сайт", "Добавляете её на свой сайт — или передаёте тому, кто им занимается."],
    ["3", "Готово!", "Чат сразу появляется на сайте и начинает работать. Больше ничего не нужно."],
  ];
  const iw = (PAGE_W - 2 * M - 2 * 0.4) / 3;
  ist.forEach((st, i) => {
    const x = M + i * (iw + 0.4), y = 2.95;
    card(s, x, y, iw, 2.05);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.28, y: y - 0.28, w: 0.66, h: 0.66, rectRadius: 0.14, fill: { color: C.purple }, line: { color: "FFFFFF", width: 2 } });
    s.addText(st[0], { x: x + 0.28, y: y - 0.28, w: 0.66, h: 0.66, align: "center", valign: "middle", fontFace: FONT, fontSize: 24, bold: true, color: "FFFFFF", margin: 0 });
    s.addText(st[1], { x: x + 0.3, y: y + 0.5, w: iw - 0.6, h: 0.45, fontFace: FONT, fontSize: 15, bold: true, color: C.ink, margin: 0 });
    s.addText(st[2], { x: x + 0.3, y: y + 0.95, w: iw - 0.6, h: 0.95, fontFace: FONT, fontSize: 11.5, color: C.gray, margin: 0, lineSpacingMultiple: 1.1 });
  });
  // code box
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.35, w: 8.3, h: 0.7, rectRadius: 0.1, fill: { color: C.purpleNight }, line: { type: "none" }, shadow: makeShadow({ opacity: 0.15 }) });
  s.addText([{ text: "<script ", options: { color: "8FE3C4" } }, { text: 'src="lemnity.ru/embed.js?id=', options: { color: "FFFFFF" } }, { text: "ВАШ-ЧАТ", options: { color: "F5C84B" } }, { text: '">', options: { color: "FFFFFF" } }], { x: M + 0.3, y: 5.35, w: 7.7, h: 0.7, fontFace: "Consolas", fontSize: 13, valign: "middle", margin: 0 });
  // reassure pill
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.1, y: 5.35, w: PAGE_W - M - 9.1, h: 0.7, rectRadius: 0.12, fill: { color: "DFF3E2" }, line: { type: "none" } });
  s.addText([{ text: "🤝  ", options: {} }, { text: "Не уверены? Установим за вас — бесплатно.", options: { bold: true } }], { x: 9.25, y: 5.35, w: PAGE_W - M - 9.3, h: 0.7, fontFace: FONT, fontSize: 12, color: "1F7A43", valign: "middle", margin: 0, lineSpacingMultiple: 1.0 });
  footer(s, 8);

  /* ============================================================ 9. PRICE FORMATION */
  s = pres.addSlide(); bg(s, C.bg);
  kicker(s, "Формирование цены");
  title(s, ["Один тариф — всё включено"], { size: 34 });
  s.addText("Никаких скрытых модулей и доплат: AI-агент, мессенджеры и white-label уже в цене. Платите только за число операторов.", { x: M, y: 2.5, w: 11.9, h: 0.6, fontFace: FONT, fontSize: 14, color: C.gray, lineSpacingMultiple: 1.1, margin: 0 });

  const colY = 3.2;
  // LEFT — flat tier card («всё включено»)
  const tW = 5.35, tH = 3.5;
  card(s, M, colY, tW, tH, { fill: C.purple, line: false });
  s.addText("ТАРИФ «ЧАТ» · ВСЁ ВКЛЮЧЕНО", { x: M + 0.32, y: colY + 0.27, w: tW - 0.5, h: 0.32, fontFace: FONT, fontSize: 10, bold: true, color: "FFFFFF", transparency: 18, margin: 0, valign: "middle" });
  s.addText([{ text: "1 290 ", options: { bold: true } }, { text: "₽/мес", options: { fontSize: 16 } }], { x: M + 0.32, y: colY + 0.6, w: tW - 0.5, h: 0.68, fontFace: FONT, fontSize: 36, bold: true, color: "FFFFFF", margin: 0 });
  s.addText("для 1 оператора", { x: M + 0.32, y: colY + 1.28, w: tW - 0.5, h: 0.3, fontFace: FONT, fontSize: 12.5, color: "FFFFFF", transparency: 14, margin: 0 });
  const inc = ["Чат в реальном времени", "Бот-сценарии и отделы", "Telegram, MAX, ВКонтакте", "AI-агент (~1 000 ответов/мес)", "White-label — убрать логотип", "Размещение на 1 сайте"];
  inc.forEach((t, i) => {
    const y = colY + 1.7 + i * 0.265;
    s.addImage({ data: I["FaCheckFFFFFF"], x: M + 0.34, y: y + 0.035, w: 0.15, h: 0.15 });
    s.addText(t, { x: M + 0.58, y: y - 0.04, w: tW - 0.8, h: 0.28, fontFace: FONT, fontSize: 11, color: "FFFFFF", transparency: 5, valign: "middle", margin: 0 });
  });

  // RIGHT column
  const rX = M + tW + 0.5, rW = PAGE_W - M - rX;
  // add-on card — per extra operator
  const aH = 1.4;
  card(s, rX, colY, rW, aH);
  iconTile(s, rX + 0.32, colY + 0.4, 0.6, "FaUserPlus5951E5");
  s.addText("Дополнительный оператор", { x: rX + 1.12, y: colY + 0.32, w: rW - 2.7, h: 0.4, fontFace: FONT, fontSize: 15.5, bold: true, color: C.ink, margin: 0, valign: "middle" });
  s.addText("за каждого нового сотрудника в команде", { x: rX + 1.12, y: colY + 0.74, w: rW - 2.7, h: 0.4, fontFace: FONT, fontSize: 11.5, color: C.gray, margin: 0, valign: "middle" });
  s.addText([{ text: "+490 ", options: { bold: true } }, { text: "₽", options: { fontSize: 14 } }], { x: rX + rW - 1.75, y: colY + 0.34, w: 1.55, h: 0.5, align: "right", fontFace: FONT, fontSize: 26, bold: true, color: C.purple, margin: 0 });
  s.addText("в месяц", { x: rX + rW - 1.75, y: colY + 0.9, w: 1.55, h: 0.3, align: "right", fontFace: FONT, fontSize: 10.5, color: C.gray, margin: 0 });

  // example calc card (dark)
  const eY = colY + aH + 0.3, eH = tH - aH - 0.3;
  card(s, rX, eY, rW, eH, { fill: C.purpleNight, line: false });
  s.addText("ПРИМЕР РАСЧЁТА", { x: rX + 0.32, y: eY + 0.24, w: rW - 0.5, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: "8FE3C4", margin: 0, valign: "middle" });
  s.addText("Команда из 3 операторов:", { x: rX + 0.32, y: eY + 0.55, w: rW - 0.5, h: 0.32, fontFace: FONT, fontSize: 13, color: "FFFFFF", transparency: 12, margin: 0 });
  s.addText([{ text: "1 290 ₽ ", options: { bold: true } }, { text: "(база) ", options: {} }, { text: "+ 490 ₽ × 2 ", options: { bold: true } }, { text: "(доп.)", options: {} }], { x: rX + 0.32, y: eY + 0.9, w: rW - 0.5, h: 0.35, fontFace: FONT, fontSize: 13, color: "FFFFFF", transparency: 10, margin: 0 });
  s.addText([{ text: "= 2 270 ", options: { bold: true } }, { text: "₽/мес", options: { fontSize: 15 } }], { x: rX + 0.32, y: eY + 1.22, w: rW - 0.5, h: 0.55, fontFace: FONT, fontSize: 28, bold: true, color: "FFFFFF", margin: 0 });
  footer(s, 9);

  /* ============================================================ 10. CTA */
  s = pres.addSlide(); bg(s, C.purpleNight);
  s.addShape(pres.shapes.OVAL, { x: 8.5, y: -2.2, w: 7, h: 7, fill: { color: C.purple, transparency: 74 }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: -2, y: 3.5, w: 6, h: 6, fill: { color: C.lilac, transparency: 82 }, line: { type: "none" } });
  s.addImage({ path: logos.white, x: PAGE_W / 2 - (0.42 * (230 / 51)) / 2, y: 1.2, h: 0.42, w: 0.42 * (230 / 51) });
  s.addText([{ text: "Клиенты ближе —", options: { breakLine: true } }, { text: "продажи выше", options: {} }], { x: 1, y: 2.3, w: PAGE_W - 2, h: 2.0, align: "center", fontFace: FONT, fontSize: 50, bold: true, color: "FFFFFF", lineSpacingMultiple: 1.0, margin: 0 });
  s.addText("Подключите чат «Lemnity» и отвечайте посетителям так же легко, как пишете близким.", { x: 2.5, y: 4.35, w: PAGE_W - 5, h: 0.9, align: "center", fontFace: FONT, fontSize: 16, color: "FFFFFF", transparency: 18, lineSpacingMultiple: 1.15, margin: 0 });
  // CTA button
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: PAGE_W / 2 - 1.55, y: 5.45, w: 3.1, h: 0.72, rectRadius: 0.36, fill: { color: "FFFFFF" }, line: { type: "none" }, shadow: makeShadow({ opacity: 0.3, color: "000000" }) });
  s.addText([{ text: "Подключить чат   ", options: { bold: true } }], { x: PAGE_W / 2 - 1.55, y: 5.45, w: 3.1, h: 0.72, align: "center", valign: "middle", fontFace: FONT, fontSize: 16, color: C.purple, margin: 0 });
  s.addImage({ data: I["FaArrowRight5951E5"], x: PAGE_W / 2 + 0.85, y: 5.72, w: 0.2, h: 0.18 });
  s.addText("lemnity.ru   ·   Чат для вашего сайта", { x: 0.5, y: PAGE_H - 0.7, w: PAGE_W - 1, h: 0.3, align: "center", fontFace: FONT, fontSize: 12, color: "FFFFFF", transparency: 35, bold: true, margin: 0 });

  await pres.writeFile({ fileName: path.join(OUT, "Lemnity-Chat.pptx") });
  console.log("OK → Lemnity-Chat.pptx");
})();
