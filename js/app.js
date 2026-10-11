import { ALIASES, COUNTRIES, COUNTRY_BY_CODE, flag, scatter } from './countries.js';
import { normalize, suggest } from './greetings.js';
import * as store from './store.js';

const $ = (sel) => document.querySelector(sel);
const app = $('#app');
const globeEl = $('#globe');
const helloInput = $('#hello');
const searchInput = $('#search');
const listEl = $('#countries');
const dropBtn = $('#drop');
const againBtn = $('#again');
const doneText = $('#doneText');
const statsEl = $('#stats');
const toastEl = $('#toast');

// Pinned CDN version so a future three-globe release can't change the look.
const TEXTURES = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.4/example/img';
const PIN_COLOR = '#ff2b3a';
const COOLDOWN_MS = 10_000;

const state = {
  greeting: '',
  selected: null, // country object
  suggested: [], // country codes
  pins: new Map(), // id -> pin row
  lastDropAt: 0,
  saving: false,
};

// ------------------------------------------------------------------ helpers

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Trim, collapse whitespace, strip control characters, cap at 40 characters. */
const cleanGreeting = (s) =>
  Array.from(s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim())
    .slice(0, 40)
    .join('');

let toastTimer;
function toast(message, ms = 2600) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

function setPhase(phase) {
  app.dataset.phase = phase;
}

// Keep the layout glued to the *visible* area so the on-screen keyboard
// doesn't push the sheet off-screen (iOS Safari doesn't resize the layout viewport).
function fitViewport() {
  const vv = window.visualViewport;
  // Multiply by scale so pinch-zooming the page doesn't shrink the layout; only the keyboard should.
  const h = vv ? vv.height * vv.scale : window.innerHeight;
  app.style.height = `${Math.round(h)}px`;
  window.scrollTo(0, 0);
}
window.visualViewport?.addEventListener('resize', fitViewport);
window.addEventListener('resize', fitViewport);
fitViewport();

// -------------------------------------------------------------------- globe

const globe = Globe({ animateIn: true })(globeEl)
  .globeImageUrl(`${TEXTURES}/earth-blue-marble.jpg`)
  .bumpImageUrl(`${TEXTURES}/earth-topology.png`)
  .backgroundImageUrl(`${TEXTURES}/night-sky.png`)
  .atmosphereColor('#6db8ff')
  .atmosphereAltitude(0.22)
  // Red pins: a thin stem standing off the surface.
  .pointsData([])
  .pointLat('lat')
  .pointLng('lng')
  .pointColor(() => PIN_COLOR)
  .pointAltitude(0.09)
  .pointRadius(0.34)
  .pointResolution(8)
  .pointLabel(
    (p) => `<div class="pin-tip">${esc(p.greeting)}<small>${flag(p.country_code)} ${esc(p.country_name)}</small></div>`,
  )
  .onPointClick((p) => {
    toast(`“${p.greeting}” · ${flag(p.country_code)} ${p.country_name}`);
    globe.pointOfView({ lat: p.lat, lng: p.lng }, 800);
  })
  // Pulsing rings: preview of the chosen country, and a ripple on fresh pins.
  .ringsData([])
  .ringLat('lat')
  .ringLng('lng')
  .ringColor(() => (t) => `rgba(255, 90, 100, ${1 - t})`)
  .ringMaxRadius(4)
  .ringPropagationSpeed(2.2)
  .ringRepeatPeriod(1000)
  .onGlobeReady(() => $('#loading').classList.add('hidden'));

function sizeGlobe() {
  globe.width(globeEl.clientWidth).height(globeEl.clientHeight);
}
new ResizeObserver(sizeGlobe).observe(globeEl);
sizeGlobe();

globe.pointOfView({ lat: 20, lng: 10, altitude: 3 });

const controls = globe.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 160;
controls.maxDistance = 450;

// Spin on its own, pause while the user drags, resume shortly after.
let resumeTimer;
const canAutoRotate = () => !state.selected;
controls.addEventListener('start', () => {
  clearTimeout(resumeTimer);
  controls.autoRotate = false;
});
controls.addEventListener('end', () => {
  clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => {
    controls.autoRotate = canAutoRotate();
  }, 4000);
});

function refreshPins() {
  globe.pointsData([...state.pins.values()]);
  const countries = new Set([...state.pins.values()].map((p) => p.country_code)).size;
  const n = state.pins.size;
  statsEl.textContent = n
    ? `${n.toLocaleString()} ${n === 1 ? 'hello' : 'hellos'} from ${countries} ${countries === 1 ? 'country' : 'countries'}`
    : 'Be the first to drop a pin';
}

function addPinToGlobe(pin, { ripple = false } = {}) {
  if (state.pins.has(pin.id)) return;
  state.pins.set(pin.id, pin);
  refreshPins();
  if (ripple) {
    const ring = { lat: pin.lat, lng: pin.lng };
    transientRings.push(ring);
    syncRings();
    setTimeout(() => {
      transientRings.splice(transientRings.indexOf(ring), 1);
      syncRings();
    }, 3500);
  }
}

let previewRing = null;
const transientRings = [];
function syncRings() {
  globe.ringsData(previewRing ? [previewRing, ...transientRings] : [...transientRings]);
}

function flyTo(country) {
  controls.autoRotate = false;
  clearTimeout(resumeTimer);
  globe.pointOfView({ lat: country.lat, lng: country.lng, altitude: 1.7 }, 1000);
}

// ------------------------------------------------------------- country list

let renderedKey = '';

// Accent-insensitive search text per country ("Türkiye" is found by "turkiye" and "turkey").
const SEARCH_TEXT = new Map(COUNTRIES.map((c) => [c.code, normalize(`${c.name} ${ALIASES[c.code] ?? ''}`)]));

function countryRow(c) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.dataset.code = c.code;
  btn.setAttribute('aria-pressed', String(state.selected?.code === c.code));
  const f = document.createElement('span');
  f.className = 'flag';
  f.textContent = flag(c.code);
  const name = document.createElement('span');
  name.textContent = c.name;
  btn.append(f, name);
  li.append(btn);
  return li;
}

function groupHeading(text) {
  const li = document.createElement('li');
  li.className = 'group';
  li.textContent = text;
  return li;
}

function renderList() {
  const query = normalize(searchInput.value);
  const key = `${query}|${state.suggested.join(',')}`;
  if (key === renderedKey) return;
  renderedKey = key;

  const frag = document.createDocumentFragment();
  if (query) {
    const hits = COUNTRIES.filter((c) => SEARCH_TEXT.get(c.code).includes(query));
    hits.forEach((c) => frag.append(countryRow(c)));
    if (!hits.length) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'No country found';
      frag.append(li);
    }
  } else {
    const likely = state.suggested.map((code) => COUNTRY_BY_CODE.get(code)).filter(Boolean);
    if (likely.length) {
      frag.append(groupHeading('Likely matches'));
      likely.forEach((c) => frag.append(countryRow(c)));
      frag.append(groupHeading('All countries'));
    }
    COUNTRIES.forEach((c) => frag.append(countryRow(c)));
  }
  listEl.replaceChildren(frag);
  listEl.scrollTop = 0; // new results: start at the top, where "Likely matches" are
}

function updateDropButton() {
  dropBtn.disabled = !state.selected || state.saving;
  dropBtn.textContent = state.saving
    ? 'Dropping pin…'
    : state.selected
      ? `📍 Drop my pin in ${state.selected.name}`
      : 'Pick a country';
}

function selectCountry(code) {
  const country = COUNTRY_BY_CODE.get(code);
  if (!country) return;
  state.selected = country;
  listEl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.code === code)));
  updateDropButton();
  helloInput.blur();
  searchInput.blur();
  previewRing = { lat: country.lat, lng: country.lng };
  syncRings();
  flyTo(country);
}

function clearSelection() {
  state.selected = null;
  previewRing = null;
  syncRings();
  updateDropButton();
}

// ------------------------------------------------------------------ events

// Open / close the bottom panel: tap the handle, or swipe it up / down.
const sheet = $('#sheet');
const sheetToggle = $('#sheetToggle');
let dragStartY = null;
let swiped = false;

function setCollapsed(collapsed) {
  sheet.dataset.collapsed = String(collapsed);
  sheetToggle.setAttribute('aria-expanded', String(!collapsed));
  sheetToggle.setAttribute('aria-label', collapsed ? 'Open panel' : 'Close panel');
  if (collapsed) document.activeElement?.blur?.(); // drop the keyboard
}

sheetToggle.addEventListener('pointerdown', (e) => {
  dragStartY = e.clientY;
  swiped = false;
});
sheetToggle.addEventListener('pointerup', (e) => {
  if (dragStartY === null) return;
  const dy = e.clientY - dragStartY;
  dragStartY = null;
  if (Math.abs(dy) > 24) {
    swiped = true;
    setCollapsed(dy > 0);
  }
});
sheetToggle.addEventListener('pointercancel', () => {
  dragStartY = null;
});
sheetToggle.addEventListener('click', () => {
  if (swiped) {
    swiped = false;
    return;
  }
  setCollapsed(sheet.dataset.collapsed !== 'true');
});

helloInput.addEventListener('input', () => {
  state.greeting = cleanGreeting(helloInput.value);
  if (!state.greeting) {
    clearSelection();
    state.suggested = [];
    renderedKey = '';
    setPhase('idle');
    return;
  }
  state.suggested = suggest(state.greeting);
  renderList();
  setPhase('pick');
});

searchInput.addEventListener('input', renderList);

listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-code]');
  if (btn) selectCountry(btn.dataset.code);
});

dropBtn.addEventListener('click', async () => {
  if (!state.selected || !state.greeting || state.saving) return;
  const wait = state.lastDropAt + COOLDOWN_MS - Date.now();
  if (wait > 0) {
    toast(`Easy there — try again in ${Math.ceil(wait / 1000)}s`);
    return;
  }

  const country = state.selected;
  const greeting = state.greeting;
  const spot = scatter(country);
  state.saving = true;
  updateDropButton();
  try {
    const saved = await store.addPin({
      greeting,
      country_code: country.code,
      country_name: country.name,
      lat: spot.lat,
      lng: spot.lng,
    });
    state.lastDropAt = Date.now();
    clearSelection(); // also removes the preview ring
    addPinToGlobe(saved, { ripple: true });
    globe.pointOfView({ lat: saved.lat, lng: saved.lng, altitude: 1.9 }, 900);
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      controls.autoRotate = true;
    }, 6000);
    doneText.replaceChildren(
      document.createTextNode('You said '),
      Object.assign(document.createElement('b'), { textContent: `“${greeting}”` }),
      document.createTextNode(` from ${flag(country.code)} ${country.name}`),
    );
    setPhase('done');
  } catch (err) {
    console.error('Could not save pin', err);
    toast('Couldn’t save your pin. Please try again.');
  } finally {
    state.saving = false;
    updateDropButton();
  }
});

againBtn.addEventListener('click', () => {
  helloInput.value = '';
  searchInput.value = '';
  state.greeting = '';
  state.suggested = [];
  renderedKey = '';
  clearSelection();
  setPhase('idle');
  controls.autoRotate = true;
  helloInput.focus();
});

// ------------------------------------------------------------------- start

async function start() {
  $('#demoNote').hidden = store.isLive;
  updateDropButton();
  try {
    const pins = await store.loadPins();
    pins.forEach((p) => state.pins.set(p.id, p));
  } catch (err) {
    console.error('Could not load pins', err);
    toast('Couldn’t load pins. Check your Supabase settings.', 5000);
  }
  refreshPins();

  store
    .subscribe((pin) => addPinToGlobe(pin, { ripple: true }))
    .catch((err) => console.warn('Realtime unavailable', err));
}
start();
