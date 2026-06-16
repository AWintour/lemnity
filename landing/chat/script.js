/* =========================================================
   Lemnity «Чат» лендинг — интерактив
   ========================================================= */
(function () {
  "use strict";

  // --- TODO: подставить боевые URL перед публикацией (см. README.md) ---
  var LINKS = {
    register: "https://lemnity.ru/login", // регистрация / вход (все CTA: Попробовать / Начать)
    policy: "https://lemnity.ru/docs/privacy",
    offer: "https://lemnity.ru/docs/offer"
  };

  document.querySelectorAll("[data-cta]").forEach(function (el) {
    var key = el.getAttribute("data-cta");
    if (LINKS[key]) {
      el.setAttribute("href", LINKS[key]);
      if (key === "register") el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    }
  });

  // --- Год в футере ---
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --- Reveal on scroll (staggered) ---
  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var siblings = Array.prototype.slice.call(
          entry.target.parentElement.querySelectorAll(":scope > [data-reveal]")
        );
        var idx = Math.max(0, siblings.indexOf(entry.target));
        entry.target.style.transitionDelay = Math.min(idx * 80, 320) + "ms";
        entry.target.classList.add("in");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // --- Header shadow on scroll ---
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // --- FAQ: аккордеон (открыт один пункт) ---
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  // --- Анимация чата в мокапе (копия из лендинга партнёрства) ---
  var chat = document.getElementById("chat");
  var mock = document.getElementById("mock");
  if (chat && mock) {
    var MSGS = [
      { w: "them", t: "Здравствуйте! Я ассистент Lemnity — подскажу по тарифам или позову оператора." },
      { w: "me", t: "Можно подключить Telegram и MAX?" },
      { w: "them", t: "Да, оба нативно — плюс ВКонтакте и чат на сайте. Всё в одном окне 🙌" }
    ];
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var mkBub = function (m) { var b = document.createElement("div"); b.className = "bub " + m.w + " in"; b.textContent = m.t; return b; };
    var mkTyping = function () { var t = document.createElement("div"); t.className = "bub typing"; t.innerHTML = "<i></i><i></i><i></i>"; return t; };
    var chatRunning = false;
    var runChat = function () {
      if (chatRunning) return;
      chatRunning = true;
      if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
        chat.innerHTML = "";
        MSGS.forEach(function (m) { var b = mkBub(m); b.classList.remove("in"); b.style.opacity = 1; chat.appendChild(b); });
        return;
      }
      (async function loop() {
        while (true) {
          chat.innerHTML = ""; await wait(550);
          for (var i = 0; i < MSGS.length; i++) {
            var m = MSGS[i];
            if (m.w === "them") { var t = mkTyping(); chat.appendChild(t); await wait(850); t.remove(); chat.appendChild(mkBub(m)); await wait(950); }
            else { chat.appendChild(mkBub(m)); await wait(1150); }
          }
          await wait(2800);
        }
      })();
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es, ob) {
        es.forEach(function (e) { if (e.isIntersecting) { runChat(); ob.disconnect(); } });
      }, { threshold: 0.3 }).observe(mock);
    } else {
      runChat();
    }
  }

  // --- Плавный скролл с учётом высоты шапки ---
  var headerH = header ? header.offsetHeight : 0;
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
})();
