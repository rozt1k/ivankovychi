/* Концепт 3 «Креслення». x, y — позиція номера (над будинком) на кресленні у відсотках; status 'free' | 'reserved' | 'sold'.
   Ділянки 2 і 5 мають демо-статуси, щоб показати замовнику всі три стани. */
const LOTS = [
  { id: 1, ha: '0,088 га', area: '8,8 сотки', x: 37.7, y: 20.9, status: 'free' },
  { id: 2, ha: '0,075 га', area: '7,5 сотки', x: 67.1, y: 27.8, status: 'reserved' },
  { id: 3, ha: '0,079 га', area: '7,9 сотки', x: 31.5, y: 41.1, status: 'free' },
  { id: 4, ha: '0,070 га', area: '7,0 сотки', x: 61.6, y: 43.5, status: 'free' },
  { id: 5, ha: '0,067 га', area: '6,7 сотки', x: 27.4, y: 63.7, status: 'sold' },
  { id: 6, ha: '0,080 га', area: '8,0 сотки', x: 58.2, y: 70.1, status: 'free' },
];
const STATUS = { free: 'Вільна', reserved: 'Заброньована', sold: 'Продана' };

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* Меню */
const bar = $('#top-bar');
const burger = $('#burger');
function setMenu(open) {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  bar.classList.toggle('menu-open', open);
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

/* Генплан */
const map = $('#planMap');
const pick = $('#lotPick');
const interest = $('#c3Interest');
let current = 1;

LOTS.forEach((lot) => {
  const n = document.createElement('button');
  n.type = 'button';
  n.className = 'lotnum';
  n.style.left = lot.x + '%';
  n.style.top = lot.y + '%';
  n.dataset.lot = lot.id;
  n.dataset.status = lot.status;
  n.textContent = lot.id;
  n.setAttribute('aria-label', `Ділянка ${lot.id}, ${lot.ha}, ${STATUS[lot.status].toLowerCase()}`);
  n.addEventListener('click', () => select(lot.id));
  map.appendChild(n);

  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.lot = lot.id;
  b.dataset.status = lot.status;
  b.textContent = lot.id;
  b.setAttribute('aria-label', `Ділянка ${lot.id}, ${STATUS[lot.status].toLowerCase()}`);
  b.addEventListener('click', () => select(lot.id));
  pick.appendChild(b);
});

function select(id) {
  current = id;
  const lot = LOTS.find((l) => l.id === id);
  $('#lotNum').textContent = lot.id;
  $('#lotArea').textContent = `${lot.ha} · ${lot.area}`;
  const st = $('#lotStatus');
  st.textContent = STATUS[lot.status];
  st.dataset.status = lot.status;
  $('#lotBtn').textContent = lot.status === 'sold' ? 'Ділянка продана, підібрати іншу' : `Дізнатися ціну ділянки ${id}`;
  $$('.lotnum', map).forEach((el) => el.classList.toggle('is-active', +el.dataset.lot === id));
  $$('button', pick).forEach((el) => el.setAttribute('aria-pressed', String(+el.dataset.lot === id)));
}
select(1);

/* Що обрано: показуємо над формою, щоб людина бачила, про що заявка */
const pickNote = $('#pickNote');
function setInterest(value) {
  interest.value = value;
  $('#pickText').textContent = value;
  pickNote.hidden = !value;
}
$('#pickClear').addEventListener('click', () => { setInterest(''); $('#c3Name').focus(); });
$('#lotBtn').addEventListener('click', () => {
  const lot = LOTS.find((l) => l.id === current);
  setInterest(lot.status === 'sold' ? '' : `Ділянка ${current}`);
});
$$('[data-house]').forEach((a) => a.addEventListener('click', () => setInterest(`Будинок: ${a.dataset.house.toLowerCase()}`)));

/* Фасади */
$$('.house').forEach((house) => {
  const imgs = $$('[data-facades] img', house);
  const btns = $$('.toggle button', house);
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
  const name = $('#c3Name');
  const phone = $('#c3Phone');
  const digits = phone.value.replace(/\D/g, '');
  fieldError(name, name.value.trim() ? '' : 'Вкажіть ім’я');
  fieldError(phone, digits.length >= 10 && digits.length <= 13 ? '' : 'Вкажіть номер телефону');
  const bad = $('[aria-invalid="true"]', form);
  if (bad) { bad.focus(); return; }
  msg.textContent = 'Заявку надіслано. Менеджер зателефонує найближчим часом.';
  msg.hidden = false;
  form.reset();
  setInterest('');
});
