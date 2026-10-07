/* АВТОГРАФ — интерактив. Без фреймворков, всё нативно. */
(() => {
  'use strict';

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка при скролле ---------- */
  const header = document.querySelector('.header');
  const onScrollHeader = () => header.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Мобильное меню ---------- */
  const burger = document.querySelector('.burger');
  const mnav = document.querySelector('.mnav');
  const closeMnav = () => {
    burger.classList.remove('open');
    mnav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  burger.addEventListener('click', () => {
    const open = mnav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMnav));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMnav(); });

  /* ---------- Появление блоков + рисование линий ---------- */
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* Длина path для рукописных линий — чтобы рисовались ровно */
  document.querySelectorAll('.squig path').forEach(p => {
    const len = Math.ceil(p.getTotalLength());
    p.style.setProperty('--len', len);
  });

  /* ---------- Световой короб: выключатель ---------- */
  const lb = document.querySelector('.lightbox-card');
  if (lb) {
    const flip = () => {
      lb.classList.toggle('off');
      const st = lb.querySelector('[data-state]');
      if (st) st.textContent = lb.classList.contains('off') ? 'выкл — нажмите, чтобы включить' : 'вкл — вывеска работает';
      lb.setAttribute('aria-pressed', String(!lb.classList.contains('off')));
    };
    lb.addEventListener('click', flip);
    lb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  }

  /* ---------- Параллакс витрины в hero ---------- */
  const showcase = document.querySelector('.showcase');
  if (showcase && !prefersReduced && matchMedia('(pointer: fine)').matches) {
    const layers = showcase.querySelectorAll('[data-depth]');
    let raf = null, tx = 0, ty = 0;
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    const apply = () => {
      layers.forEach(l => {
        const d = parseFloat(l.dataset.depth || 6);
        l.style.transform = `translate3d(${(tx * d).toFixed(1)}px, ${(ty * d).toFixed(1)}px, 0)`;
      });
      raf = null;
    };
    hero.addEventListener('mouseleave', () => layers.forEach(l => l.style.transform = ''));
  }

  /* ---------- Аккордеон услуг ---------- */
  document.querySelectorAll('.svc').forEach(item => {
    const head = item.querySelector('.svc-head');
    head.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      document.querySelectorAll('.svc.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.svc-head').setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('open', willOpen);
      head.setAttribute('aria-expanded', String(willOpen));
    });
  });

  /* ---------- «Запросить расчёт» из услуги → подстановка в форму ---------- */
  const msgField = document.querySelector('#f-msg');
  document.querySelectorAll('[data-order]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const topic = link.dataset.order;
      if (msgField) {
        msgField.value = `Здравствуйте! Интересует: ${topic.toLowerCase()}. `;
        msgField.focus({ preventScroll: true });
      }
      document.querySelector('#lead').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Форма: собрать сообщение → ВК + буфер ---------- */
  const form = document.querySelector('#lead-form');
  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = text => {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 5200);
  };
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = form.elements.name.value.trim();
      const phone = form.elements.phone.value.trim();
      const msg = form.elements.msg.value.trim();
      if (!phone) { form.elements.phone.focus(); return; }
      const text =
        `Заявка с сайта «Автограф»!\n` +
        (name ? `Имя: ${name}\n` : '') +
        `Телефон: ${phone}\n` +
        (msg ? `Задача: ${msg}` : '');
      try { await navigator.clipboard.writeText(text); } catch (_) { /* буфер недоступен — не страшно */ }
      showToast('Открываем сообщения ВКонтакте — текст заявки уже скопирован. Вставьте его в сообщение (Ctrl+V или долгое нажатие → «Вставить»).');
      setTimeout(() => window.open('https://vk.me/ag.autograf', '_blank', 'noopener'), 600);
      form.reset();
    });
  }

  /* ---------- Плавный скролл для якорей (fallback) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' }); }
    });
  });

  /* ---------- Год в футере ---------- */
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- Тема: тёмная / светлая ч/б ---------- */
(() => {
  const root = document.documentElement;
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem('avtograf-theme', next); } catch (_) {}
      btn.setAttribute('aria-pressed', String(next === 'light'));
    });
  });
})();

/* ---------- Рукописные линии: рисовать при появлении ---------- */
(() => {
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('play'); io.unobserve(e.target); }
  }, { threshold: 0.25 });
  document.querySelectorAll('.squig').forEach(s => io.observe(s));
})();


/* ---------- MAX: нет прямых ссылок — копируем номер ---------- */
(() => {
  const a = document.querySelector('[data-max]');
  if (!a) return;
  a.addEventListener('click', () => {
    try { navigator.clipboard.writeText('+7 906 682-36-48'); } catch (_) {}
    const t = document.querySelector('.toast');
    if (t) { t.textContent = 'Номер скопирован — откроем MAX, найдите нас по номеру +7 906 682-36-48'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 5200); }
  });
})();
