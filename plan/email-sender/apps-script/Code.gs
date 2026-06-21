/**
 * Lemnity cold-mailer — Google Apps Script.
 *
 * Отправка холодных цепочек с рабочей почты (Gmail / Workspace) прямо из облака
 * Google. Состояние — в листе таблицы. Письма цепочки идут одним тредом (follow-up
 * = reply в тот же диалог, Gmail сам ставит "Re:"). Ответы клиента определяются
 * автоматически — цепочка по ответившему останавливается.
 *
 * Порядок установки — см. README.md в этой папке. Кратко:
 *   1) Extensions → Apps Script в нужной Google Таблице, вставить этот файл.
 *   2) Заполнить CONFIG ниже.
 *   3) Запустить setup() один раз (создаст лист и шапку), вставить контакты.
 *   4) Запустить run() вручную для проверки, затем installTriggers().
 */

// ======================= НАСТРОЙКИ ========================================= //
var CONFIG = {
  SHEET_NAME: 'Contacts',

  // Алиас отправителя. Должен быть настроен в Gmail как "Отправлять письма как"
  // (Settings → Accounts). Оставьте '' — будет основной адрес аккаунта.
  SENDER_ALIAS: '',           // напр. 'hello@lemnity.ru'
  SENDER_NAME:  'Александр, Lemnity',

  DAILY_LIMIT: 25,            // максимум писем за один прогон (= один триггер/день)

  // Подстановки в тексты писем:
  DEMO_LINK:    'https://lemnity.ru/demo',
  PARTNER_LINK: 'https://lemnity.ru/partners',
  COMMISSION:   '20–30%',
  SENDER_TELEGRAM: '@lemnity_ru',

  // Расписание цепочки: через сколько дней от ПЕРВОГО письма уходит шаг 2 и 3.
  OFFSETS: [0, 3, 7]
};

// Шапка листа Contacts. Порядок столбцов можно менять — код ищет по имени.
var HEADERS = [
  'Email', 'Company', 'Name', 'Website', 'City', 'Sequence',
  'Step', 'Status', 'FirstSentAt', 'LastSentAt', 'ThreadId', 'Subject', 'Note'
];

// ======================= ШАБЛОНЫ ЦЕПОЧЕК =================================== //
var SEQUENCES = {
  // Веб-студии / агентства — партнёрский угол (white-label + комиссия)
  studio: {
    subject: 'Чат для ваших клиентов — под брендом {company}',
    steps: [
      // Шаг 1 — заход
      '{greeting}\n\n' +
      'Вы делаете сайты под ключ — и наверняка ставите клиентам онлайн-чат, чаще ' +
      'всего Jivo. Клиент за него платит каждый месяц, а студия с этого не получает ' +
      'ничего.\n\n' +
      'Мы сделали Lemnity — российский чат-виджет (в реестре отечественного ПО, ' +
      'данные в РФ). Для студий есть white-label: ставите клиентам под своим брендом ' +
      'и получаете повторяющуюся комиссию с каждого. Перенос с Jivo и настройку ' +
      'берём на себя.\n\n' +
      '60 секунд, как это выглядит: {demo_link}\n\n' +
      'Дам партнёрский доступ — поставите на один проект, без обязательств. Скинуть?\n\n' +
      '{sender_name}, Lemnity · {sender_email}',

      // Шаг 2 — польза + снятие возражений
      '{recipient_name}, добавлю по сути — почему студии переходят с Jivo на нас:\n\n' +
      '• Белый лейбл — клиент видит ваш бренд, не наш.\n' +
      '• Комиссия {commission} с каждого клиента, ежемесячно, пока он пользуется.\n' +
      '• Реестр РФ + данные в РФ — закрывает импортозамещение, многим заказчикам это ' +
      'уже принципиально.\n' +
      '• Помимо чата — обратный звонок, видео-виджет, «Колесо фортуны», таймеры: есть ' +
      'что допродать клиенту.\n\n' +
      'Работы вам не добавляется — перенос и настройку делаем мы. Дать доступ на один ' +
      'проект?\n\n' +
      '{sender_name}, Lemnity',

      // Шаг 3 — мягкое закрытие
      '{recipient_name}, закрываю тему, чтобы не надоедать 🙂\n\n' +
      'Если ставите клиентам чаты — терять нечего: дам партнёрский доступ, попробуете ' +
      'на одном проекте. Понравится — обсудим условия, нет — просто ответьте «не ' +
      'актуально», и я не пишу.\n\n' +
      'Партнёрские условия на одной странице: {partner_link}\n\n' +
      '{sender_name}, Lemnity · {sender_telegram}'
    ]
  },

  // Прямой клиент (бизнес в нишах)
  business: {
    subject: '{website} — чат, который не теряет заявки',
    steps: [
      '{greeting}\n\n' +
      'Зашёл на {website}. В нишах, где каждый лид дорогой, чат с быстрым ответом ' +
      'реально добавляет заявок.\n\n' +
      'Мы — Lemnity, российский чат-виджет (реестр ПО, данные в РФ). Предлагаю просто: ' +
      'поставим и настроим за вас, 14 дней бесплатно. Если стоит Jivo — перенесём без ' +
      'потерь.\n\n' +
      'Как это выглядит за минуту: {demo_link}\n\n' +
      'Поставить вам пробную версию? Отвечу — согласуем удобное время.\n\n' +
      '{sender_name}, Lemnity · {sender_email}',

      '{recipient_name}, чтобы было предметно — что получаете на сайт:\n\n' +
      '• Онлайн-чат + операторы, обратный звонок, видео-виджет.\n' +
      '• Геймификация («Колесо фортуны») и таймеры — поднимают конверсию формы.\n' +
      '• Заявки из чата, Telegram, MAX, VK — в одном окне.\n' +
      '• Данные в РФ, в реестре отечественного ПО.\n\n' +
      'Всё ставим и настраиваем мы — с вашей стороны 0 работы. 14 дней бесплатно, ' +
      'дальше решаете.\n\n' +
      'Скажите день — поставлю и покажу на вашем сайте.\n\n' +
      '{sender_name}, Lemnity',

      '{recipient_name}, не хочу быть навязчивым — последнее письмо по теме.\n\n' +
      'Предложение в силе: бесплатно поставим и настроим чат на {website} на 14 дней, ' +
      'перенос с текущего берём на себя. Терять нечего — если не подойдёт, просто ' +
      'отключим.\n\n' +
      'Готов запустить — ответьте «давайте». Если не актуально, тоже напишите пару ' +
      'слов, не буду беспокоить.\n\n' +
      '{sender_name}, Lemnity · {sender_telegram}'
    ]
  }
};

// ======================= МЕНЮ В ТАБЛИЦЕ =================================== //
/** Рисует меню «📧 Lemnity» при открытии таблицы — управление в один клик. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📧 Lemnity')
    .addItem('1. Создать/проверить лист', 'setup')
    .addItem('2. Запустить сейчас (тест)', 'runWithToast_')
    .addSeparator()
    .addItem('3. Включить автопилот (вт/ср/чт 10:00)', 'installTriggers')
    .addItem('Выключить автопилот', 'removeTriggers')
    .addToUi();
}

function runWithToast_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.toast('Отправляю…', 'Lemnity', 5);
  run();
  ss.toast('Готово. Подробности — View → Logs.', 'Lemnity', 5);
}

// ======================= ОСНОВНОЙ ПРОГОН =================================== //
/** Вызывается триггером (или вручную). Отправляет всем, кому пора, до лимита. */
function run() {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) { Logger.log('Лист пуст — нет контактов.'); return; }

  var col = indexMap_(values[0]);
  var myEmail = (CONFIG.SENDER_ALIAS || Session.getActiveUser().getEmail()).toLowerCase();
  var today = new Date();

  // Собираем кандидатов: follow-up'ы важнее новых первых писем.
  var followups = [], fresh = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var status = String(row[col.Status] || '').toLowerCase();
    if (status && status !== 'active') continue;       // replied/done/unsubscribed/bounced
    var email = String(row[col.Email] || '').trim();
    if (!email || email.indexOf('@') === -1) continue;
    var seqName = String(row[col.Sequence] || 'studio').trim() || 'studio';
    if (!SEQUENCES[seqName]) continue;
    var step = Number(row[col.Step] || 0);
    if (step >= SEQUENCES[seqName].steps.length) continue;

    var item = { rowIndex: r + 1, row: row, col: col, seqName: seqName, step: step, email: email };
    if (step === 0) {
      fresh.push(item);
    } else {
      var first = row[col.FirstSentAt] ? new Date(row[col.FirstSentAt]) : null;
      var due = first && daysBetween_(first, today) >= CONFIG.OFFSETS[step];
      if (due) followups.push(item);
    }
  }

  var queue = followups.concat(fresh);
  var sent = 0;

  for (var i = 0; i < queue.length && sent < CONFIG.DAILY_LIMIT; i++) {
    var it = queue[i];
    try {
      if (it.step === 0) {
        sendFirst_(sheet, it, myEmail);
        sent++;
      } else {
        var threadId = String(it.row[col.ThreadId] || '');
        if (threadId && hasReply_(threadId, myEmail)) {
          setCell_(sheet, it.rowIndex, col.Status, 'replied');   // ответил — стоп
          continue;
        }
        sendFollowup_(sheet, it, threadId);
        sent++;
      }
      Utilities.sleep(1500);  // лёгкая пауза между письмами
    } catch (e) {
      Logger.log('Ошибка по ' + it.email + ': ' + e);
    }
  }
  Logger.log('Прогон завершён. Отправлено: ' + sent);
}

function sendFirst_(sheet, it, myEmail) {
  var seq = SEQUENCES[it.seqName];
  var fields = fieldsFor_(it.row, it.col);
  var subject = render_(seq.subject, fields);
  var body = render_(seq.steps[0], fields);

  var msg = GmailApp.createDraft(it.email, subject, body, sendOptions_()).send();
  var threadId = msg.getThread().getId();
  var now = new Date();

  var c = it.col, ri = it.rowIndex;
  setCell_(sheet, ri, c.Step, 1);
  setCell_(sheet, ri, c.Status, 'active');
  setCell_(sheet, ri, c.FirstSentAt, now);
  setCell_(sheet, ri, c.LastSentAt, now);
  setCell_(sheet, ri, c.ThreadId, threadId);
  setCell_(sheet, ri, c.Subject, subject);
  Logger.log('✓ письмо 1 → ' + it.email);
}

function sendFollowup_(sheet, it, threadId) {
  var seq = SEQUENCES[it.seqName];
  var fields = fieldsFor_(it.row, it.col);
  var body = render_(seq.steps[it.step], fields);

  var thread = GmailApp.getThreadById(threadId);
  if (!thread) throw new Error('тред не найден: ' + threadId);
  thread.reply(body, sendOptions_());   // остаётся в том же диалоге, Gmail ставит "Re:"

  var newStep = it.step + 1;
  var c = it.col, ri = it.rowIndex;
  setCell_(sheet, ri, c.Step, newStep);
  setCell_(sheet, ri, c.LastSentAt, new Date());
  if (newStep >= seq.steps.length) setCell_(sheet, ri, c.Status, 'done');
  Logger.log('✓ письмо ' + newStep + ' → ' + it.email);
}

// ======================= НАСТРОЙКА / ТРИГГЕРЫ ============================== //
/** Создаёт лист Contacts с шапкой, если его ещё нет. Запустить один раз. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  ss.toast('Лист "' + CONFIG.SHEET_NAME + '" готов. Заполните Email / Company / Website.',
    'Lemnity', 6);
  Logger.log('Готово. Заполните столбцы Email / Company / Name / Website / City / Sequence.');
}

/** Ставит триггеры: вт/ср/чт в 10:00 (лучшее время для первого касания). */
function installTriggers() {
  removeTriggers();
  var days = [ScriptApp.WeekDay.TUESDAY, ScriptApp.WeekDay.WEDNESDAY, ScriptApp.WeekDay.THURSDAY];
  for (var i = 0; i < days.length; i++) {
    ScriptApp.newTrigger('run').timeBased().onWeekDay(days[i]).atHour(10).create();
  }
  SpreadsheetApp.getActiveSpreadsheet().toast('Автопилот включён: вт/ср/чт 10:00.', 'Lemnity', 6);
  Logger.log('Триггеры установлены: вт/ср/чт 10:00.');
}

function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'run') ScriptApp.deleteTrigger(t);
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('Автопилот выключен.', 'Lemnity', 6);
}

// ======================= ХЕЛПЕРЫ ========================================== //
function getSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) throw new Error('Нет листа "' + CONFIG.SHEET_NAME + '". Запустите setup().');
  return sheet;
}

function indexMap_(headerRow) {
  var map = {};
  for (var i = 0; i < headerRow.length; i++) map[String(headerRow[i]).trim()] = i;
  HEADERS.forEach(function (h) {
    if (!(h in map)) throw new Error('В шапке нет столбца "' + h + '". Запустите setup().');
  });
  return map;
}

function fieldsFor_(row, col) {
  var name = String(row[col.Name] || '').trim();
  return {
    greeting: name ? 'Здравствуйте, ' + name + '!' : 'Здравствуйте!',
    recipient_name: name,
    company: String(row[col.Company] || '').trim(),
    website: String(row[col.Website] || '').trim(),
    city: String(row[col.City] || '').trim(),
    commission: CONFIG.COMMISSION,
    demo_link: CONFIG.DEMO_LINK,
    partner_link: CONFIG.PARTNER_LINK,
    sender_name: CONFIG.SENDER_NAME,
    sender_email: CONFIG.SENDER_ALIAS || Session.getActiveUser().getEmail(),
    sender_telegram: CONFIG.SENDER_TELEGRAM
  };
}

function render_(tpl, f) {
  return tpl.replace(/\{(\w+)\}/g, function (m, k) { return (k in f) ? f[k] : m; });
}

function sendOptions_() {
  var opts = { name: CONFIG.SENDER_NAME };
  if (CONFIG.SENDER_ALIAS) opts.from = CONFIG.SENDER_ALIAS;
  return opts;
}

/** Есть ли в треде входящее письмо (= клиент ответил)? */
function hasReply_(threadId, myEmail) {
  var thread = GmailApp.getThreadById(threadId);
  if (!thread) return false;
  var msgs = thread.getMessages();
  for (var i = 0; i < msgs.length; i++) {
    if (String(msgs[i].getFrom()).toLowerCase().indexOf(myEmail) === -1) return true;
  }
  return false;
}

function daysBetween_(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

function setCell_(sheet, rowIndex, colIndex, value) {
  sheet.getRange(rowIndex, colIndex + 1).setValue(value);
}
