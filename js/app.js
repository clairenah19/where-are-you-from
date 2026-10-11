import { ALIASES, COUNTRIES, COUNTRY_BY_CODE, flagUrl, scatter } from './countries.js';
import { normalize, suggest } from './greetings.js';
import * as store from './store.js';

const $ = (sel) => document.querySelector(sel);
const app = $('#app');
const globeEl = $('#globe');
const sheet = $('#sheet');
const sheetToggle = $('#sheetToggle');
const helloInput = $('#hello');
const searchInput = $('#search');
const listEl = $('#countries');
const dropBtn = $('#drop');
const dropLabel = $('#dropLabel');
const againBtn = $('#again');
const viewGlobeBtn = $('#viewGlobe');
const doneText = $('#doneText');
const statsEl = $('#stats');
const statMain = $('#statMain');
const statSub = $('#statSub');
const stepLabel = $('#stepLabel');
const splashMsg = $('#splashMsg');
const toastEl = $('#toast');

// Pinned CDN version so a future three-globe release can't change the look.
const TEXTURES = 'https://cdn.jsdelivr.net/npm/three-globe@2.45.4/example/img';
const TEXTURE_URLS = ['earth-blue-marble.jpg', 'earth-topology.png', 'night-sky.png'].map((f) => `${TEXTURES}/${f}`);
const PIN_COLOR = '#ff3344';
const PIN_HEIGHT = 0.09;
const PIN_HEIGHT_HOVER = 0.15;
const COOLDOWN_MS = 10_000;
const MIN_SPLASH_MS = 1100; // avoid a flash of the splash screen on fast connections
const SPLASH_FAILSAFE_MS = 15_000;
const COMPACT_BELOW_PX = 500; // visible height under which the sheet switches to its compact layout
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  greeting: '',
  selected: null, // country object
  suggested: [], // country codes
  pins: new Map(), // id -> pin row
  lastDropAt: 0,
  saving: false,
};

// ------------------------------------------------------------------ helpers

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Trim, collapse whitespace, strip control characters, cap at 40 characters. */
const cleanGreeting = (s) =>
  Array.from(s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim())
    .slice(0, 40)
    .join('');

const preload = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = url;
  });

function flagEl(code) {
  const img = new Image(24, 18);
  img.className = 'flag';
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = flagUrl(code);
  return img;
}

let toastTimer;
function toast(message, { tone = 'ok', ms = 2600 } = {}) {
  toastEl.textContent = message;
  toastEl.dataset.tone = tone;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

const STEP_LABELS = { idle: 'Step 1 of 2', pick: 'Step 2 of 2', done: 'Complete' };
function setPhase(phase) {
  app.dataset.phase = phase;
  stepLabel.textContent = STEP_LABELS[phase];
}

// ----------------------------------------------------- viewport & orientation

// Keep the layout glued to the *visible* area so the on-screen keyboard doesn't push the sheet
// off-screen. iOS Safari doesn't resize the layout viewport for the keyboard; it pans the visual
// viewport instead, so follow that too.
function fitViewport() {
  const vv = window.visualViewport;
  // Multiply by scale so pinch-zooming the page doesn't shrink the layout; only the keyboard should.
  const height = vv ? vv.height * vv.scale : window.innerHeight;
  const offsetTop = vv && vv.scale === 1 ? vv.offsetTop : 0;
  app.style.height = `${Math.round(height)}px`;
  app.style.transform = offsetTop ? `translateY(${Math.round(offsetTop)}px)` : '';
  app.dataset.compact = String(height < COMPACT_BELOW_PX);
}
window.visualViewport?.addEventListener('resize', fitViewport);
window.visualViewport?.addEventListener('scroll', fitViewport);
window.addEventListener('resize', fitViewport);
fitViewport();

// "Rotate your device" notice. This must use the device's real orientation: on Android the keyboard
// shrinks the page, so a CSS width-vs-height check wrongly reads portrait phones as landscape.
const isPhoneSizedTouchDevice = () =>
  window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 700;

function deviceIsLandscape() {
  const type = screen.orientation?.type;
  if (type) return type.startsWith('landscape');
  if (typeof window.orientation === 'number') return Math.abs(window.orientation) === 90; // older iOS
  return false;
}

const textFieldFocused = () => document.activeElement instanceof HTMLInputElement;

// Narrowest phone held sideways is ~560 CSS px wide; the widest phone held upright is ~480.
const LANDSCAPE_MIN_WIDTH = 540;

function updateOrientation() {
  // Two signals must agree: the device reports landscape AND the page shape matches. With the keyboard
  // open the page height is unreliable (it shrinks), so then only the width, which the keyboard
  // never changes, is compared.
  const pageIsLandscape = textFieldFocused()
    ? window.innerWidth >= LANDSCAPE_MIN_WIDTH
    : window.innerWidth > window.innerHeight;
  const landscape = deviceIsLandscape() && pageIsLandscape;
  document.documentElement.dataset.landscape = String(isPhoneSizedTouchDevice() && landscape);
}
screen.orientation?.addEventListener?.('change', updateOrientation);
window.addEventListener('orientationchange', updateOrientation);
window.addEventListener('resize', updateOrientation);
document.addEventListener('focusin', updateOrientation);
document.addEventListener('focusout', updateOrientation);
updateOrientation();

// -------------------------------------------------------------------- globe

let resolveGlobeReady;
const globeReady = new Promise((resolve) => (resolveGlobeReady = resolve));

let hoverPin = null;
const pinHeight = (p) => (p === hoverPin ? PIN_HEIGHT_HOVER : PIN_HEIGHT);

const globe = Globe({ animateIn: true })(globeEl)
  .globeImageUrl(TEXTURE_URLS[0])
  .bumpImageUrl(TEXTURE_URLS[1])
  .backgroundImageUrl(TEXTURE_URLS[2])
  .atmosphereColor('#6db8ff')
  .atmosphereAltitude(0.22)
  // Red pins: a thin stem standing off the surface; it rises when hovered.
  .pointsData([])
  .pointLat('lat')
  .pointLng('lng')
  .pointColor(() => PIN_COLOR)
  .pointAltitude(pinHeight)
  .pointRadius(0.34)
  .pointResolution(8)
  .pointsTransitionDuration(REDUCED_MOTION ? 0 : 600)
  .pointLabel(
    (p) => `<div class="pin-tip">
      <span class="pin-tip-greeting">${esc(p.greeting)}</span>
      <span class="pin-tip-country"><img class="flag" src="${esc(flagUrl(p.country_code))}" alt="" width="18" height="13">${esc(p.country_name)}</span>
    </div>`,
  )
  .onPointHover((p) => {
    hoverPin = p;
    globeEl.style.cursor = p ? 'pointer' : '';
    globe.pointAltitude((d) => pinHeight(d)); // new function so the globe re-reads heights
  })
  .onPointClick((p) => {
    toast(`“${p.greeting}” · ${p.country_name}`);
    globe.pointOfView({ lat: p.lat, lng: p.lng }, REDUCED_MOTION ? 0 : 800);
  })
  // Pulsing rings: preview of the chosen country, and a ripple on fresh pins.
  .ringsData([])
  .ringLat('lat')
  .ringLng('lng')
  .ringColor(() => (t) => `rgba(255, 90, 100, ${1 - t})`)
  .ringMaxRadius(4)
  .ringPropagationSpeed(2.2)
  .ringRepeatPeriod(1000)
  .onGlobeReady(() => resolveGlobeReady());

// Cap the pixel ratio: 3x phone screens gain little and burn battery.
globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

// Don't render while the tab is in the background.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) globe.pauseAnimation();
  else globe.resumeAnimation();
});

function sizeGlobe() {
  globe.width(globeEl.clientWidth).height(globeEl.clientHeight);
}
new ResizeObserver(sizeGlobe).observe(globeEl);
sizeGlobe();

// Start zoomed out; the camera glides in once the splash screen lifts.
globe.pointOfView({ lat: 20, lng: 10, altitude: 4.2 });

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

// ---------------------------------------------------------------------- stats

let shownStats = { pins: 0, countries: 0 };
let statsFrame;

function paintStats(pins, countries, final) {
  statsEl.dataset.state = 'ready';
  [statMain, statSub].forEach((el) => {
    el.classList.remove('skeleton');
    el.style.width = '';
  });
  if (final && pins === 0) {
    statMain.textContent = 'No greetings yet';
    statSub.textContent = 'Be the first';
    return;
  }
  statMain.textContent = `${pins.toLocaleString()} ${pins === 1 ? 'greeting' : 'greetings'}`;
  statSub.textContent = `${countries.toLocaleString()} ${countries === 1 ? 'country' : 'countries'}`;
}

/** Count up to the new totals. */
function updateStats() {
  const pins = state.pins.size;
  const countries = new Set([...state.pins.values()].map((p) => p.country_code)).size;
  cancelAnimationFrame(statsFrame);
  const from = { ...shownStats };
  const duration = REDUCED_MOTION ? 0 : 900;
  const start = performance.now();
  const step = (now) => {
    const k = duration ? Math.min(1, (now - start) / duration) : 1;
    const eased = 1 - (1 - k) ** 3;
    shownStats = {
      pins: Math.round(from.pins + (pins - from.pins) * eased),
      countries: Math.round(from.countries + (countries - from.countries) * eased),
    };
    paintStats(shownStats.pins, shownStats.countries, k === 1);
    if (k < 1) statsFrame = requestAnimationFrame(step);
  };
  statsFrame = requestAnimationFrame(step);
}

function refreshPins() {
  globe.pointsData([...state.pins.values()]);
  updateStats();
}

let previewRing = null;
const transientRings = [];
function syncRings() {
  globe.ringsData(previewRing ? [previewRing, ...transientRings] : [...transientRings]);
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

function flyTo(country) {
  controls.autoRotate = false;
  clearTimeout(resumeTimer);
  globe.pointOfView({ lat: country.lat, lng: country.lng, altitude: 1.7 }, REDUCED_MOTION ? 0 : 1000);
}

// ------------------------------------------------------------- country list

let renderedKey = '';

// Accent-insensitive search text per country ("Türkiye" is found by "turkiye" and "turkey").
const SEARCH_TEXT = new Map(COUNTRIES.map((c) => [c.code, normalize(`${c.name} ${ALIASES[c.code] ?? ''}`)]));

const CHECK_ICON =
  '<svg class="row-check" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

function countryRow(c, index) {
  const li = document.createElement('li');
  if (index < 8) {
    li.className = 'enter';
    li.style.setProperty('--i', index);
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.dataset.code = c.code;
  btn.setAttribute('aria-pressed', String(state.selected?.code === c.code));
  const name = document.createElement('span');
  name.textContent = c.name;
  btn.append(flagEl(c.code), name);
  btn.insertAdjacentHTML('beforeend', CHECK_ICON);
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
    hits.forEach((c, i) => frag.append(countryRow(c, i)));
    if (!hits.length) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'No country found';
      frag.append(li);
    }
  } else {
    const likely = state.suggested.map((code) => COUNTRY_BY_CODE.get(code)).filter(Boolean);
    if (likely.length) {
      frag.append(groupHeading('Suggested'));
      likely.forEach((c, i) => frag.append(countryRow(c, i)));
      frag.append(groupHeading('All countries'));
    }
    COUNTRIES.forEach((c) => frag.append(countryRow(c, 99)));
  }
  listEl.replaceChildren(frag);
  listEl.scrollTop = 0; // new results: start at the top, where the suggestions are
}

function updateDropButton() {
  dropBtn.disabled = !state.selected || state.saving;
  dropBtn.dataset.loading = String(state.saving);
  dropLabel.textContent = state.saving
    ? 'Dropping pin…'
    : state.selected
      ? `Drop pin in ${state.selected.name}`
      : 'Select a country';
}

/** `reveal`: scroll the row into view (only needed when chosen via the keyboard; a tapped row is already visible). */
function selectCountry(code, { reveal = false } = {}) {
  const country = COUNTRY_BY_CODE.get(code);
  if (!country) return;
  state.selected = country;
  // A country can appear twice (under "Suggested" and under "All countries"); mark both.
  listEl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.code === code)));
  if (reveal) {
    listEl
      .querySelector(`button[data-code="${code}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  }
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

// -------------------------------------------------------------------- sheet

function setCollapsed(collapsed) {
  sheet.dataset.collapsed = String(collapsed);
  sheetToggle.setAttribute('aria-expanded', String(!collapsed));
  sheetToggle.setAttribute('aria-label', collapsed ? 'Open panel' : 'Close panel');
  if (collapsed) document.activeElement?.blur?.(); // drop the keyboard
}
const isCollapsed = () => sheet.dataset.collapsed === 'true';

// Tap the handle to toggle, or swipe it down (close) / up (open). Taps are handled on pointerup
// rather than waiting for a click, which can be unreliable on iOS after touch-action: none.
let press = null;
let lastPointerAction = 0;

sheetToggle.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  press = { y: e.clientY };
  try {
    sheetToggle.setPointerCapture(e.pointerId);
  } catch {
    /* the pointer already ended (a very quick tap); the tap is still handled on pointerup */
  }
});
sheetToggle.addEventListener('pointerup', (e) => {
  if (!press) return;
  const dy = e.clientY - press.y;
  press = null;
  lastPointerAction = Date.now();
  if (Math.abs(dy) > 24) setCollapsed(dy > 0);
  else setCollapsed(!isCollapsed());
});
sheetToggle.addEventListener('pointercancel', () => {
  press = null;
});
// Keyboard / assistive-technology activation (and a fallback if pointer events never fired).
sheetToggle.addEventListener('click', () => {
  if (Date.now() - lastPointerAction < 600) return;
  setCollapsed(!isCollapsed());
});

// ------------------------------------------------------------------ events

helloInput.addEventListener('input', () => {
  state.greeting = cleanGreeting(helloInput.value);
  if (!state.greeting) {
    clearSelection();
    state.suggested = [];
    renderedKey = '';
    setPhase('idle');
    return;
  }
  const wasIdle = app.dataset.phase === 'idle';
  state.suggested = suggest(state.greeting);
  renderList();
  setPhase('pick');
  // The list is hidden until now; make sure it opens at the top, on the suggestions.
  if (wasIdle) requestAnimationFrame(() => (listEl.scrollTop = 0));
});

// Enter picks the best suggestion, so the keyboard flow is: type, Enter, drop.
helloInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.isComposing) return;
  e.preventDefault();
  const best = state.suggested[0];
  if (best && !state.selected) selectCountry(best, { reveal: true });
  else helloInput.blur();
});

searchInput.addEventListener('input', renderList);

listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-code]');
  if (btn) selectCountry(btn.dataset.code);
});

dropBtn.addEventListener('click', async () => {
  if (!state.selected || !state.greeting || state.saving) return;
  const remaining = state.lastDropAt + COOLDOWN_MS - Date.now();
  if (remaining > 0) {
    toast(`Please wait ${Math.ceil(remaining / 1000)}s before adding another`, { tone: 'error' });
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
    globe.pointOfView({ lat: saved.lat, lng: saved.lng, altitude: 1.9 }, REDUCED_MOTION ? 0 : 900);
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      controls.autoRotate = true;
    }, 6000);

    const quoted = document.createElement('strong');
    quoted.textContent = `“${greeting}”`;
    const where = document.createElement('span');
    where.className = 'where';
    where.append(flagEl(country.code), document.createTextNode(country.name));
    doneText.replaceChildren(quoted, where);

    navigator.vibrate?.(12);
    setPhase('done');
  } catch (err) {
    console.error('Could not save pin', err);
    toast('Couldn’t save your pin. Please try again.', { tone: 'error', ms: 4000 });
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

viewGlobeBtn.addEventListener('click', () => setCollapsed(true));

// ------------------------------------------------------------------- start

function setSplashMessage(text) {
  splashMsg.textContent = text;
}

function revealApp() {
  app.dataset.ready = 'true';
  // Glide in from the zoomed-out start position.
  globe.pointOfView({ lat: 20, lng: 10, altitude: 2.8 }, REDUCED_MOTION ? 0 : 2400);
}

async function start() {
  demoBadgeInit();
  updateDropButton();

  let revealed = false;
  const failsafe = wait(SPLASH_FAILSAFE_MS);

  // Everything the first view needs: globe, textures, font, and the pins.
  const world = Promise.all([globeReady, document.fonts?.ready, ...TEXTURE_URLS.map(preload)]).then(() =>
    setSplashMessage('Loading greetings'),
  );
  const loaded = store.loadPins().then(
    (pins) => {
      pins.forEach((p) => state.pins.set(p.id, p));
      if (revealed) refreshPins(); // arrived after the failsafe
    },
    (err) => {
      console.error('Could not load pins', err);
      toast('Couldn’t load pins. Check your Supabase settings.', { tone: 'error', ms: 5000 });
    },
  );

  await Promise.race([Promise.all([world, loaded, wait(MIN_SPLASH_MS)]), failsafe]);
  revealed = true;
  revealApp();
  refreshPins();

  store
    .subscribe((pin) => addPinToGlobe(pin, { ripple: true }))
    .catch((err) => console.warn('Realtime unavailable', err));
}

function demoBadgeInit() {
  $('#demoBadge').hidden = store.isLive;
  statsEl.dataset.mode = store.isLive ? 'live' : 'demo';
}

start();
