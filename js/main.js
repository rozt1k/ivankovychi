/* =========================================================
   НАЛАШТУВАННЯ — редагуйте тут
   ========================================================= */

/* Куди відправляти заявки з форми (POST, JSON).
   Наприклад: адреса Formspree, Make/Zapier webhook або ваш сервер для Telegram-бота.
   Поки порожньо — форма лише показує повідомлення «Заявку надіслано» (демо-режим). */
const FORM_ENDPOINT = '';

/* Ділянки на генплані.
   x, y — позиція маркера у відсотках від ширини/висоти зображення генплану.
   status: 'free' — вільна, 'reserved' — заброньована, 'sold' — продана. */
const LOTS = [
  { id: 1, area: '8,8 сотки', x: 43.0, y: 23.5, status: 'free' },
  { id: 2, area: '7,5 сотки', x: 64.0, y: 31.5, status: 'free' },
  { id: 3, area: '7,9 сотки', x: 39.0, y: 45.5, status: 'free' },
  { id: 4, area: '7,0 сотки', x: 59.5, y: 53.5, status: 'free' },
  { id: 5, area: '6,7 сотки', x: 38.0, y: 75.5, status: 'free' },
  { id: 6, area: '8,0 сотки', x: 56.5, y: 80.0, status: 'free' },
];
const LOT_FEATURES = 'Будинок, басейн, тераса, навіс для авто';
const STATUS_TEXT = { free: 'Вільна', reserved: 'Заброньована', sold: 'Продана' };

/* ========================================================= */

document.documentElement.classList.add('js');

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Шапка, меню, мобільна панель ---------- */
const header = $('#header');
const burger = $('#burger');
const nav = $('#nav');
const mbar = $('#mbar');
const hero = $('.hero');

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('is-solid', y > 40);
  mbar.classList.toggle('is-visible', y > hero.offsetHeight * 0.6);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

function setMenu(open) {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  header.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* Підсвічування поточного розділу в меню */
const navLinks = $$('.nav a[href^="#"]');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['about', 'plan', 'houses', 'gallery', 'location'].forEach((id) => { const s = document.getElementById(id); if (s) sectionObs.observe(s); });

/* ---------- Поява зображень ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); revealObs.unobserve(en.target); }
  });
}, { rootMargin: '0px 0px -10% 0px' });
$$('.reveal').forEach((el) => revealObs.observe(el));

/* ---------- Генплан ---------- */
const map = $('#planMap');
const list = $('#lotList');
const lotSelect = $('#fLot');
let currentLot = LOTS[0].id;

LOTS.forEach((lot) => {
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'pin';
  pin.style.left = lot.x + '%';
  pin.style.top = lot.y + '%';
  pin.dataset.lot = lot.id;
  pin.dataset.status = lot.status;
  pin.textContent = lot.id;
  pin.setAttribute('aria-label', `Ділянка ${lot.id}, ${lot.area}, ${STATUS_TEXT[lot.status].toLowerCase()}`);
  pin.addEventListener('click', () => selectLot(lot.id));
  map.appendChild(pin);

  const li = document.createElement('li');
  li.innerHTML = `<button type="button" data-lot="${lot.id}" aria-pressed="false">Ділянка ${lot.id}<small>${lot.area}</small></button>`;
  li.firstChild.addEventListener('click', () => selectLot(lot.id));
  list.appendChild(li);

  const opt = document.createElement('option');
  opt.value = `Ділянка ${lot.id}`;
  opt.textContent = `Ділянка ${lot.id} · ${lot.area}`;
  if (lot.status === 'sold') opt.disabled = true;
  lotSelect.appendChild(opt);
});

['Двоповерховий з балконом', 'Двоповерховий з вітражем', 'Одноповерховий'].forEach((name) => {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = `Будинок: ${name.toLowerCase()}`;
  lotSelect.appendChild(opt);
});

function selectLot(id) {
  const lot = LOTS.find((l) => l.id === id);
  if (!lot) return;
  currentLot = id;
  const num = $('#lotNum');
  num.style.opacity = 0;
  setTimeout(() => { num.textContent = lot.id; num.style.opacity = 1; }, 150);
  $('#lotArea').textContent = lot.area;
  const st = $('#lotStatus');
  st.textContent = STATUS_TEXT[lot.status];
  st.dataset.status = lot.status;
  $('#lotFeatures').textContent = LOT_FEATURES;
  const btn = $('#lotBtn');
  btn.textContent = lot.status === 'sold' ? 'Підібрати іншу ділянку' : `Дізнатися ціну ділянки ${lot.id}`;
  $$('.pin', map).forEach((p) => p.classList.toggle('is-active', +p.dataset.lot === id));
  $$('button', list).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.lot === id)));
}
selectLot(currentLot);

$('#lotBtn').addEventListener('click', () => {
  const lot = LOTS.find((l) => l.id === currentLot);
  if (lot && lot.status !== 'sold') lotSelect.value = `Ділянка ${lot.id}`;
});
$$('[data-house]').forEach((a) => a.addEventListener('click', () => { lotSelect.value = a.dataset.house; }));

/* ---------- Будинки: перемикач фасадів ---------- */
$$('[data-facades]').forEach((box) => {
  const imgs = $$('img', box);
  const btns = $$('.house__switch button', box);
  btns.forEach((btn, i) => btn.addEventListener('click', () => {
    imgs.forEach((im, j) => im.classList.toggle('is-active', i === j));
    btns.forEach((b, j) => { b.classList.toggle('is-active', i === j); b.setAttribute('aria-pressed', String(i === j)); });
  }));
});

/* ---------- Галерея ---------- */
const track = $('#galTrack');
const shots = $$('.shot', track);
const prev = $('#galPrev');
const next = $('#galNext');
const step = () => shots[0].getBoundingClientRect().width + 16;

prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
function updateGalNav() {
  prev.disabled = track.scrollLeft < 8;
  next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
}
track.addEventListener('scroll', updateGalNav, { passive: true });
window.addEventListener('resize', updateGalNav);
updateGalNav();

/* Лайтбокс */
const lb = $('#lightbox');
const lbImg = $('#lbImg');
const lbCount = $('#lbCount');
let lbIndex = 0;

function showShot(i) {
  lbIndex = (i + shots.length) % shots.length;
  const s = shots[lbIndex];
  lbImg.src = s.dataset.full;
  lbImg.alt = $('img', s).alt;
  lbCount.textContent = `${lbIndex + 1} / ${shots.length}`;
}
shots.forEach((s, i) => s.addEventListener('click', () => {
  showShot(i);
  if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
  document.body.style.overflow = 'hidden';
}));
function closeLb() { lb.close ? lb.close() : lb.removeAttribute('open'); }
lb.addEventListener('close', () => { document.body.style.overflow = ''; shots[lbIndex].focus(); });
$('#lbClose').addEventListener('click', closeLb);
$('#lbPrev').addEventListener('click', () => showShot(lbIndex - 1));
$('#lbNext').addEventListener('click', () => showShot(lbIndex + 1));
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showShot(lbIndex - 1);
  if (e.key === 'ArrowRight') showShot(lbIndex + 1);
});
let touchX = null;
lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showShot(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* ---------- Форма ---------- */
const form = $('#leadForm');
const done = $('#formDone');
const formError = $('#formError');

function setFieldError(input, msg) {
  const field = input.closest('.field');
  let err = $('.field__err', field);
  field.classList.toggle('is-invalid', !!msg);
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (msg) {
    if (!err) { err = document.createElement('span'); err.className = 'field__err'; err.id = input.id + 'Err'; field.appendChild(err); }
    err.textContent = msg;
    input.setAttribute('aria-describedby', err.id);
  } else if (err) { err.remove(); input.removeAttribute('aria-describedby'); }
}

function validate() {
  const nameEl = $('#fName');
  const phoneEl = $('#fPhone');
  const name = nameEl.value.trim();
  const phoneDigits = phoneEl.value.replace(/\D/g, '');
  let ok = true;
  setFieldError(nameEl, name ? '' : 'Вкажіть, як до вас звертатися');
  if (!name) ok = false;
  const phoneOk = phoneDigits.length >= 10 && phoneDigits.length <= 13;
  setFieldError(phoneEl, phoneOk ? '' : 'Вкажіть номер телефону, наприклад +380 67 123 45 67');
  if (!phoneOk) ok = false;
  return ok;
}
form.addEventListener('input', (e) => { if (e.target.closest('.field.is-invalid')) validate(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;
  if (!validate()) { $('[aria-invalid="true"]', form)?.focus(); return; }

  const btn = $('.form__submit', form);
  const data = Object.fromEntries(new FormData(form));
  data.page = location.href;
  btn.disabled = true;
  btn.textContent = 'Надсилаємо…';

  try {
    if (FORM_ENDPOINT) {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(res.status);
    } else {
      console.info('[demo] FORM_ENDPOINT не задано. Дані заявки:', data);
    }
    form.hidden = true;
    done.hidden = false;
    done.focus();
  } catch (err) {
    formError.textContent = 'Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам.';
    formError.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Записатися на перегляд';
  }
});

/* ---------- Рік у футері ---------- */
$('#year').textContent = new Date().getFullYear();
