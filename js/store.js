// Pin storage. Talks to Supabase when js/config.js is filled in; otherwise falls
// back to localStorage so the prototype is usable straight away.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { COUNTRY_BY_CODE } from './countries.js';

export const isLive = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const TABLE = 'pins';
const COLUMNS = 'id,created_at,greeting,country_code,country_name,lat,lng';
const PAGE = 1000; // PostgREST's default max rows per request
const MAX_PAGES = 10; // prototype cap: 10k pins on the globe

let client = null;

async function getClient() {
  if (!client) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.117.3');
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  }
  return client;
}

/** Load all pins (newest first). */
export async function loadPins() {
  if (!isLive) return loadLocal();
  const db = await getClient();
  const all = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await db
      .from(TABLE)
      .select(COLUMNS)
      .order('created_at', { ascending: false })
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) throw error;
    all.push(...data);
    if (data.length < PAGE) break;
  }
  return all;
}

/** Save a pin: { greeting, country_code, country_name, lat, lng }. Returns the saved row. */
export async function addPin(pin) {
  if (!isLive) return addLocal(pin);
  const db = await getClient();
  const { data, error } = await db.from(TABLE).insert(pin).select(COLUMNS).single();
  if (error) throw error;
  return data;
}

/** Call onPin for every pin other people add while the page is open. */
export async function subscribe(onPin) {
  if (!isLive) return () => {};
  const db = await getClient();
  const channel = db
    .channel('pins-feed')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, (msg) => onPin(msg.new))
    .subscribe();
  return () => db.removeChannel(channel);
}

// ---------------------------------------------------------------- demo mode

const LS_KEY = 'wayf.demo-pins.v1';

const DEMO_SEED = [
  ['Hello', 'US'], ['Bonjour', 'FR'], ['Hola', 'MX'], ['こんにちは', 'JP'], ['Namaste', 'IN'],
  ['Ciao', 'IT'], ['Olá', 'BR'], ['Sawubona', 'ZA'], ['안녕하세요', 'KR'], ['Kia ora', 'NZ'],
  ['Habari', 'KE'], ['Merhaba', 'TR'], ['Привет', 'RU'], ['مرحبا', 'EG'], ['Hej', 'SE'],
  ["G'day", 'AU'], ['Hallo', 'DE'], ['你好', 'CN'], ['Kamusta', 'PH'], ['Sveiki', 'LV'],
];

function seedPins() {
  const now = Date.now();
  return DEMO_SEED.map(([greeting, code], i) => {
    const c = COUNTRY_BY_CODE.get(code);
    return {
      id: crypto.randomUUID(),
      created_at: new Date(now - i * 60000).toISOString(),
      greeting,
      country_code: code,
      country_name: c.name,
      // Deterministic nudge so the seeded pins don't sit exactly on the centre point.
      lat: c.lat + ((i * 37) % 7) / 4 - 0.75,
      lng: c.lng + ((i * 53) % 7) / 4 - 0.75,
    };
  });
}

function loadLocal() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY));
    if (Array.isArray(stored)) return stored;
  } catch {
    /* storage unavailable or corrupt: fall through to the seed */
  }
  const seed = seedPins();
  saveLocal(seed);
  return seed;
}

function saveLocal(pins) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(pins));
  } catch {
    /* private mode / quota: pins just won't survive a reload */
  }
}

function addLocal(pin) {
  const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...pin };
  saveLocal([row, ...loadLocal()]);
  return row;
}
