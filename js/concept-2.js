/* Концепт 2 «Вечір». Дані ділянок: status 'free' | 'reserved' | 'sold'.
   Ділянки 2 і 5 мають демо-статуси, щоб показати замовнику всі три стани. */
const LOTS = [
  { id: 1, area: '8,8 сотки', x: 43.0, y: 23.5, status: 'free' },
  { id: 2, area: '7,5 сотки', x: 64.0, y: 31.5, status: 'reserved' },
  { id: 3, area: '7,9 сотки', x: 39.0, y: 45.5, status: 'free' },
  { id: 4, area: '7,0 сотки', x: 59.5, y: 53.5, status: 'free' },
  { id: 5, area: '6,7 сотки', x: 38.0, y: 75.5, status: 'sold' },
  { id: 6, area: '8,0 сотки', x: 56.5, y: 80.0, status: 'free' },
];
const STATUS = { free: 'Вільна', reserved: 'Заброньована', sold: 'Продана' };

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* Шапка й меню */
const hd = $('#hd');
const burger = $('#burger');
const onScroll = () => hd.classList.toggle('is-solid', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
function setMenu(open) {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  hd.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
$('#nav').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

const navLinks = $$('#nav a[href^="#"]');
const secObs = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['about', 'plan', 'houses'].forEach((id) => secObs.observe(document.getElementById(id)));

/* Генплан: маркери + таблиця */
const map = $('#planMap');
const rows = $('#lotRows');
const lotBtn = $('#lotBtn');
const interest = $('#c2Interest');
let current = 1;

LOTS.forEach((lot) => {
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.className = 'pin';
  pin.style.left = lot.x + '%';
  pin.style.top = lot.y + '%';
  pin.dataset.lot = lot.id;
  pin.dataset.status = lot.status;
  pin.textContent = lot.id;
  pin.setAttribute('aria-label', `Ділянка ${lot.id}, ${lot.area}, ${STATUS[lot.status].toLowerCase()}`);
  map.appendChild(pin);

  const tr = document.createElement('tr');
  tr.dataset.lot = lot.id;
  tr.dataset.status = lot.status;
  tr.innerHTML = `<td><button type="button" class="lot-num" aria-label="Обрати ділянку ${lot.id}">${lot.id}</button></td>
    <td><span>${lot.area}</span></td>
    <td><span class="st" data-status="${lot.status}">${STATUS[lot.status]}</span></td>`;
  rows.appendChild(tr);

  [pin, tr].forEach((el) => {
    el.addEventListener('click', () => select(lot.id));
    el.addEventListener('mouseenter', () => hover(lot.id, true));
    el.addEventListener('mouseleave', () => hover(lot.id, false));
  });
});

function hover(id, on) {
  $$(`[data-lot="${id}"]`).forEach((el) => el.classList.toggle('is-hover', on));
}
function select(id) {
  current = id;
  const lot = LOTS.find((l) => l.id === id);
  $$('.pin', map).forEach((p) => p.classList.toggle('is-active', +p.dataset.lot === id));
  $$('tr', rows).forEach((r) => r.classList.toggle('is-active', +r.dataset.lot === id));
  lotBtn.textContent = lot.status === 'sold' ? 'Ділянка продана, підібрати іншу' : `Дізнатися ціну ділянки ${id}`;
}
select(1);

/* Що обрано: показуємо над формою, щоб людина бачила, про що заявка */
const pickNote = $('#pickNote');
function setInterest(value) {
  interest.value = value;
  $('#pickText').textContent = value;
  pickNote.hidden = !value;
}
$('#pickClear').addEventListener('click', () => { setInterest(''); $('#c2Name').focus(); });
lotBtn.addEventListener('click', () => {
  const lot = LOTS.find((l) => l.id === current);
  setInterest(lot.status === 'sold' ? '' : `Ділянка ${current}`);
});
$$('[data-house]').forEach((a) => a.addEventListener('click', () => setInterest(`Будинок: ${a.dataset.house.toLowerCase()}`)));

/* Вкладки будинків */
const tabs = $$('[role="tab"]');
function openTab(tab, focus) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
  if (focus) tab.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => openTab(t));
  t.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') openTab(tabs[(i + 1) % tabs.length], true);
    if (e.key === 'ArrowLeft') openTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
  });
});

/* Перемикач фасадів */
$$('[data-facades]').forEach((box) => {
  const imgs = $$('img', box);
  const btns = $$('.switch button', box);
  btns.forEach((b, i) => b.addEventListener('click', () => {
    imgs.forEach((im, j) => im.classList.toggle('is-active', i === j));
    btns.forEach((x, j) => { x.classList.toggle('is-active', i === j); x.setAttribute('aria-pressed', String(i === j)); });
  }));
});

/* Форма (демо: заявка нікуди не надсилається) */
const form = $('#leadForm');
const msg = $('#formMsg');
function fieldError(input, text) {
  const f = input.closest('.field');
  let err = $('.field__err', f);
  f.classList.toggle('is-invalid', !!text);
  input.setAttribute('aria-invalid', text ? 'true' : 'false');
  if (text) {
    if (!err) { err = document.createElement('span'); err.className = 'field__err'; err.id = input.id + 'Err'; f.appendChild(err); }
    err.textContent = text; input.setAttribute('aria-describedby', err.id);
  } else if (err) { err.remove(); input.removeAttribute('aria-describedby'); }
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#c2Name');
  const phone = $('#c2Phone');
  const digits = phone.value.replace(/\D/g, '');
  fieldError(name, name.value.trim() ? '' : 'Вкажіть, як до вас звертатися');
  fieldError(phone, digits.length >= 10 && digits.length <= 13 ? '' : 'Вкажіть номер, наприклад +380 67 123 45 67');
  const bad = $('[aria-invalid="true"]', form);
  if (bad) { bad.focus(); return; }
  msg.textContent = 'Заявку надіслано. Менеджер зателефонує найближчим часом.';
  msg.hidden = false;
  form.reset();
  setInterest('');
});
