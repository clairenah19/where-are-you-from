// Maps common "hello" words to the countries where they're typically said.
// Only used to float likely matches to the top of the country list; the user
// can always pick any country, so a missing word never blocks anyone.

const ES = ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ'];
const EN = ['US', 'GB', 'AU', 'CA', 'NZ', 'IE', 'ZA', 'IN', 'SG', 'PH', 'NG', 'GH', 'KE', 'JM'];
const AR = ['SA', 'AE', 'EG', 'JO', 'LB', 'SY', 'IQ', 'KW', 'QA', 'BH', 'OM', 'YE', 'PS', 'LY', 'TN', 'DZ', 'MA', 'SD'];
const ZH = ['CN', 'TW', 'SG', 'HK', 'MO', 'MY'];

const HINTS = {
  hello: EN, hi: EN, hey: EN, howdy: ['US'], yo: ['US'],
  gday: ['AU', 'NZ'], 'kia ora': ['NZ'], aloha: ['US'], 'wah gwaan': ['JM'], 'dia duit': ['IE'],
  'bore da': ['GB'], helo: ['GB'],
  bonjour: ['FR', 'CA', 'BE', 'CH', 'LU', 'MC'], salut: ['FR', 'RO', 'MD', 'CH'], bonjou: ['HT'], bonswa: ['HT'],
  hola: ES, kaixo: ['ES'], 'bon dia': ['ES', 'AD'],
  ola: ['PT', 'BR', 'AO', 'MZ', 'CV'], oi: ['BR'],
  ciao: ['IT', 'SM', 'VA', 'CH'], buongiorno: ['IT', 'SM', 'VA', 'CH'], salve: ['IT', 'VA'],
  hallo: ['DE', 'AT', 'CH', 'NL', 'BE', 'LI', 'LU', 'ZA', 'NA'], 'guten tag': ['DE', 'AT', 'CH', 'LI'],
  servus: ['AT', 'DE'], gruezi: ['CH'], goedendag: ['NL', 'BE'],
  hej: ['SE', 'DK'], hei: ['NO', 'FI'], moi: ['FI'], terve: ['FI'], 'god dag': ['NO'], halo: ['ID'],
  ahoj: ['CZ', 'SK'], 'dobry den': ['CZ', 'SK'], czesc: ['PL'], 'dzien dobry': ['PL'],
  szia: ['HU'], 'jo napot': ['HU'], buna: ['RO', 'MD'], 'buna ziua': ['RO', 'MD'],
  zdravo: ['RS', 'HR', 'BA', 'ME', 'MK', 'SI'], 'dobar dan': ['HR', 'BA', 'RS', 'ME'], pozdrav: ['HR'],
  zdraveite: ['BG'], zdrasti: ['BG'],
  privet: ['RU', 'BY', 'KZ', 'KG', 'UA'], 'привет': ['RU', 'BY', 'KZ', 'KG'],
  'здравствуйте': ['RU', 'BY', 'KZ', 'KG'], 'привіт': ['UA'], pryvit: ['UA'], vitayu: ['UA', 'BY'],
  yassou: ['GR', 'CY'], yasou: ['GR', 'CY'], 'γεια σου': ['GR', 'CY'], 'γεια': ['GR', 'CY'],
  merhaba: ['TR', 'CY'], selam: ['TR'],
  salam: ['AZ', 'IR', 'AF', 'PK', 'MY', 'ID', 'BD'], salaam: ['AF', 'IR', 'PK'],
  'assalamu alaikum': ['SA', 'BD', 'PK', 'ID', 'MY', 'EG', 'AE'],
  marhaba: AR, ahlan: AR, 'مرحبا': AR, 'اهلا': AR, 'السلام عليكم': AR,
  shalom: ['IL'], 'שלום': ['IL'],
  namaste: ['IN', 'NP'], 'नमस्ते': ['IN', 'NP'], namaskar: ['IN'], vanakkam: ['IN', 'LK', 'SG'], 'sat sri akal': ['IN'],
  'ni hao': ZH, nihao: ZH, '你好': ZH, '您好': ZH,
  konnichiwa: ['JP'], 'こんにちは': ['JP'], 'もしもし': ['JP'],
  annyeong: ['KR', 'KP'], annyeonghaseyo: ['KR', 'KP'], '안녕하세요': ['KR', 'KP'], '안녕': ['KR', 'KP'],
  sawasdee: ['TH'], sawadee: ['TH'], 'สวัสดี': ['TH'],
  'xin chao': ['VN'], sabaidee: ['LA'], suosdey: ['KH'], mingalaba: ['MM'],
  kamusta: ['PH'], mabuhay: ['PH'],
  selamat: ['ID', 'MY', 'BN', 'SG'], 'selamat pagi': ['ID', 'MY', 'BN'], 'apa kabar': ['ID'],
  sawubona: ['ZA', 'SZ'], molo: ['ZA'], dumela: ['BW', 'ZA', 'LS'],
  habari: ['KE', 'TZ'], jambo: ['KE', 'TZ', 'UG'], hujambo: ['KE', 'TZ'], mambo: ['TZ', 'KE'],
  akwaaba: ['GH'], ndewo: ['NG'], sannu: ['NG', 'NE'], bawo: ['NG'],
  tere: ['EE'], sveiki: ['LV'], labdien: ['LV'], labas: ['LT'], sveikas: ['LT'],
  miredita: ['AL', 'XK'], pershendetje: ['AL', 'XK'],
  barev: ['AM'], gamarjoba: ['GE'], 'sain baina uu': ['MN'], salom: ['UZ', 'TJ'],
  talofa: ['WS'], bula: ['FJ'], 'malo e lelei': ['TO'],
};

/** Lowercase, strip accents (not the Hangul/Kana marks), drop punctuation. */
export function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’`.,!?¡¿]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns country codes (best match first) where this greeting is likely used. */
export function suggest(greeting) {
  const input = normalize(greeting);
  if (input.length < 2) return [];
  const scores = new Map();
  for (const [key, codes] of Object.entries(HINTS)) {
    let score = 0;
    if (input === key) score = 3;
    else if (key.startsWith(input)) score = 2;
    else if (key.length >= 3 && input.includes(key)) score = 1;
    if (!score) continue;
    codes.forEach((code, i) => {
      // Earlier codes in a list are the more typical ones.
      const s = score * 100 - i;
      if (s > (scores.get(code) ?? -Infinity)) scores.set(code, s);
    });
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([code]) => code);
}
