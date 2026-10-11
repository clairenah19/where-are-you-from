// Maps "hello" words, and writing systems, to the countries where they're used.
// Only used to float likely matches to the top of the country list; the user
// can always pick any country, so a missing word never blocks anyone.

const ES = ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ'];
const EN = ['US', 'GB', 'AU', 'CA', 'NZ', 'IE', 'ZA', 'IN', 'SG', 'PH', 'NG', 'GH', 'KE', 'JM'];
const AR = ['SA', 'AE', 'EG', 'JO', 'LB', 'SY', 'IQ', 'KW', 'QA', 'BH', 'OM', 'YE', 'PS', 'LY', 'TN', 'DZ', 'MA', 'SD'];
const ZH = ['CN', 'TW', 'SG', 'HK', 'MO', 'MY'];
const FA = ['IR', 'AF', 'TJ'];
const UR = ['PK', 'IN'];
const RU = ['RU', 'BY', 'KZ', 'KG', 'UA'];

const HINTS = {
  // English & friends
  hello: EN, hi: EN, hey: EN, howdy: ['US'], yo: ['US'],
  gday: ['AU', 'NZ'], 'kia ora': ['NZ'], aloha: ['US'], 'wah gwaan': ['JM'], 'dia duit': ['IE'],
  'bore da': ['GB'], helo: ['GB'],
  // Romance
  bonjour: ['FR', 'CA', 'BE', 'CH', 'LU', 'MC'], salut: ['FR', 'RO', 'MD', 'CH'], bonjou: ['HT'], bonswa: ['HT'],
  hola: ES, kaixo: ['ES'], 'bon dia': ['ES', 'AD'],
  ola: ['PT', 'BR', 'AO', 'MZ', 'CV'], oi: ['BR'],
  ciao: ['IT', 'SM', 'VA', 'CH'], buongiorno: ['IT', 'SM', 'VA', 'CH'], salve: ['IT', 'VA'],
  buna: ['RO', 'MD'], 'buna ziua': ['RO', 'MD'],
  // Germanic
  hallo: ['DE', 'AT', 'CH', 'NL', 'BE', 'LI', 'LU', 'ZA', 'NA'], 'guten tag': ['DE', 'AT', 'CH', 'LI'],
  servus: ['AT', 'DE'], gruezi: ['CH'], goedendag: ['NL', 'BE'],
  hej: ['SE', 'DK'], hei: ['NO', 'FI'], moi: ['FI'], terve: ['FI'], 'god dag': ['NO'],
  // Slavic & Baltic
  ahoj: ['CZ', 'SK'], 'dobry den': ['CZ', 'SK'], czesc: ['PL'], 'dzien dobry': ['PL'],
  szia: ['HU'], 'jo napot': ['HU'],
  zdravo: ['RS', 'HR', 'BA', 'ME', 'MK', 'SI'], 'dobar dan': ['HR', 'BA', 'RS', 'ME'], pozdrav: ['HR'],
  zdraveite: ['BG'], zdrasti: ['BG'], 'здравейте': ['BG'], 'здравей': ['BG'],
  privet: RU, 'привет': RU, 'здравствуйте': RU, 'здравствуй': RU,
  'привіт': ['UA'], pryvit: ['UA'], vitayu: ['UA', 'BY'], 'вітаю': ['UA', 'BY'],
  tere: ['EE'], sveiki: ['LV'], labdien: ['LV'], labas: ['LT'], sveikas: ['LT'],
  // Balkans, Caucasus
  miredita: ['AL', 'XK'], pershendetje: ['AL', 'XK'],
  barev: ['AM'], 'բարեւ': ['AM'], 'բարև': ['AM'], gamarjoba: ['GE'], 'გამარჯობა': ['GE'],
  // Greek, Turkic
  yassou: ['GR', 'CY'], yasou: ['GR', 'CY'], 'γεια σου': ['GR', 'CY'], 'γεια σας': ['GR', 'CY'], 'γεια': ['GR', 'CY'],
  merhaba: ['TR', 'CY'], selam: ['TR'], salom: ['UZ', 'TJ'], 'sain baina uu': ['MN'], 'сайн байна уу': ['MN'],
  // Arabic, Persian, Urdu, Hebrew
  salam: ['AZ', 'IR', 'AF', 'PK', 'MY', 'ID', 'BD'], salaam: ['AF', 'IR', 'PK'],
  'assalamu alaikum': ['SA', 'BD', 'PK', 'ID', 'MY', 'EG', 'AE'],
  marhaba: AR, ahlan: AR, 'مرحبا': AR, 'اهلا': AR, 'أهلا': AR, 'السلام عليكم': AR,
  'سلام': [...FA, ...UR], 'آداب': UR, 'درود': FA,
  shalom: ['IL'], 'שלום': ['IL'],
  // South Asia
  namaste: ['IN', 'NP'], 'नमस्ते': ['IN', 'NP'], 'नमस्कार': ['IN', 'NP'], namaskar: ['IN'],
  vanakkam: ['IN', 'LK', 'SG'], 'வணக்கம்': ['IN', 'LK', 'SG'], 'sat sri akal': ['IN'], 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ': ['IN'],
  'হ্যালো': ['BD', 'IN'], 'নমস্কার': ['BD', 'IN'], 'আসসালামু আলাইকুম': ['BD'], 'ආයුබෝවන්': ['LK'],
  // East Asia
  'ni hao': ZH, nihao: ZH, '你好': ZH, '您好': ZH, '大家好': ZH, '哈囉': ['TW', 'HK'], '嗨': ZH,
  konnichiwa: ['JP'], 'こんにちは': ['JP'], 'こんにちわ': ['JP'], 'もしもし': ['JP'], 'おはよう': ['JP'], 'こんばんは': ['JP'],
  annyeong: ['KR', 'KP'], annyeonghaseyo: ['KR', 'KP'], '안녕하세요': ['KR', 'KP'], '안녕하십니까': ['KR', 'KP'],
  '안녕': ['KR', 'KP'], '여보세요': ['KR', 'KP'],
  // Southeast Asia
  sawasdee: ['TH'], sawadee: ['TH'], 'สวัสดี': ['TH'], 'สวัสดีครับ': ['TH'], 'สวัสดีค่ะ': ['TH'],
  'xin chao': ['VN'], sabaidee: ['LA'], 'ສະບາຍດີ': ['LA'], suosdey: ['KH'], 'សួស្តី': ['KH'],
  mingalaba: ['MM'], 'မင်္ဂလာပါ': ['MM'],
  kamusta: ['PH'], mabuhay: ['PH'],
  selamat: ['ID', 'MY', 'BN', 'SG'], 'selamat pagi': ['ID', 'MY', 'BN'], 'apa kabar': ['ID'], halo: ['ID'],
  // Africa
  sawubona: ['ZA', 'SZ'], molo: ['ZA'], dumela: ['BW', 'ZA', 'LS'],
  habari: ['KE', 'TZ'], jambo: ['KE', 'TZ', 'UG'], hujambo: ['KE', 'TZ'], mambo: ['TZ', 'KE'],
  akwaaba: ['GH'], ndewo: ['NG'], sannu: ['NG', 'NE'], bawo: ['NG'],
  'ሰላም': ['ET', 'ER'], 'ሃሎ': ['ET'],
  // Pacific
  talofa: ['WS'], bula: ['FJ'], 'malo e lelei': ['TO'],
};

/**
 * Fold text so typed input and table keys compare equal:
 * full-width -> normal, lowercase, accents removed, punctuation dropped.
 * The result is recomposed (NFC) so Hangul stays as whole syllables.
 */
export function normalize(text) {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC')
    .replace(/['’`.,!?¡¿。、，！？]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const isLatin = (s) => /^[\u0000-ɏ]*$/.test(s);

// Keys go through the same normalize() as the input.
const KEYS = Object.entries(HINTS).map(([word, codes]) => {
  const key = normalize(word);
  return { key, codes, latin: isLatin(key) };
});

// Fallback: if the greeting uses a distinctive writing system, suggest the
// countries that use it, even when the exact word isn't listed above.
const SCRIPTS = [
  [/\p{Script=Hangul}/u, ['KR', 'KP']],
  [/[\p{Script=Hiragana}\p{Script=Katakana}]/u, ['JP']],
  [/\p{Script=Han}/u, ['CN', 'TW', 'HK', 'SG', 'MO', 'MY', 'JP']],
  [/\p{Script=Thai}/u, ['TH']],
  [/\p{Script=Hebrew}/u, ['IL']],
  [/\p{Script=Devanagari}/u, ['IN', 'NP']],
  [/\p{Script=Bengali}/u, ['BD', 'IN']],
  [/\p{Script=Tamil}/u, ['IN', 'LK', 'SG']],
  [/[\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Gujarati}\p{Script=Gurmukhi}\p{Script=Oriya}]/u, ['IN']],
  [/\p{Script=Sinhala}/u, ['LK']],
  [/\p{Script=Arabic}/u, [...AR, 'IR', 'AF', 'PK']],
  [/\p{Script=Cyrillic}/u, ['RU', 'UA', 'BY', 'BG', 'RS', 'KZ', 'KG', 'TJ', 'MN', 'MK', 'ME']],
  [/\p{Script=Greek}/u, ['GR', 'CY']],
  [/\p{Script=Georgian}/u, ['GE']],
  [/\p{Script=Armenian}/u, ['AM']],
  [/\p{Script=Ethiopic}/u, ['ET', 'ER']],
  [/\p{Script=Khmer}/u, ['KH']],
  [/\p{Script=Lao}/u, ['LA']],
  [/\p{Script=Myanmar}/u, ['MM']],
];

/** Returns country codes (best match first) where this greeting is likely used. */
export function suggest(greeting) {
  const input = normalize(greeting);
  if (!input) return [];
  const latinInput = isLatin(input);
  if (latinInput && input.length < 2) return [];

  const scores = new Map();
  const bump = (code, score) => {
    if (score > (scores.get(code) ?? -Infinity)) scores.set(code, score);
  };

  for (const { key, codes, latin } of KEYS) {
    let score = 0;
    if (input === key) score = 3;
    else if (key.startsWith(input)) score = 2;
    // Short Latin keys ("hi", "oi") would match inside unrelated words; CJK keys are short by nature.
    else if ((key.length >= 3 || !latin) && input.includes(key)) score = 1;
    if (!score) continue;
    // Earlier codes in a list are the more typical ones.
    codes.forEach((code, i) => bump(code, score * 100 - i));
  }

  SCRIPTS.forEach(([re, codes]) => {
    if (re.test(input)) codes.forEach((code, i) => bump(code, 50 - i));
  });

  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([code]) => code);
}
