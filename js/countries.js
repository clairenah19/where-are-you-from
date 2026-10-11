// Country list with approximate centre points: "CODE|Name|lat|lng"
const RAW = `
AF|Afghanistan|33.9|67.7
AL|Albania|41.15|20.17
DZ|Algeria|28.03|1.66
AD|Andorra|42.55|1.6
AO|Angola|-11.2|17.87
AG|Antigua and Barbuda|17.06|-61.8
AR|Argentina|-38.4|-63.6
AM|Armenia|40.07|45.04
AU|Australia|-25.27|133.78
AT|Austria|47.52|14.55
AZ|Azerbaijan|40.14|47.58
BS|Bahamas|25.03|-77.4
BH|Bahrain|26.07|50.56
BD|Bangladesh|23.68|90.36
BB|Barbados|13.19|-59.54
BY|Belarus|53.71|27.95
BE|Belgium|50.5|4.47
BZ|Belize|17.19|-88.5
BJ|Benin|9.31|2.32
BT|Bhutan|27.51|90.43
BO|Bolivia|-16.29|-63.59
BA|Bosnia and Herzegovina|43.92|17.68
BW|Botswana|-22.33|24.68
BR|Brazil|-14.24|-51.93
BN|Brunei|4.54|114.73
BG|Bulgaria|42.73|25.49
BF|Burkina Faso|12.24|-1.56
BI|Burundi|-3.37|29.92
CV|Cabo Verde|16.0|-24.01
KH|Cambodia|12.57|104.99
CM|Cameroon|7.37|12.35
CA|Canada|56.13|-106.35
CF|Central African Republic|6.61|20.94
TD|Chad|15.45|18.73
CL|Chile|-35.68|-71.54
CN|China|35.86|104.2
CO|Colombia|4.57|-74.3
KM|Comoros|-11.88|43.87
CG|Congo|-0.23|15.83
CD|DR Congo|-4.04|21.76
CR|Costa Rica|9.75|-83.75
CI|Côte d'Ivoire|7.54|-5.55
HR|Croatia|45.1|15.2
CU|Cuba|21.52|-77.78
CY|Cyprus|35.13|33.43
CZ|Czechia|49.82|15.47
DK|Denmark|56.26|9.5
DJ|Djibouti|11.83|42.59
DM|Dominica|15.41|-61.37
DO|Dominican Republic|18.74|-70.16
EC|Ecuador|-1.83|-78.18
EG|Egypt|26.82|30.8
SV|El Salvador|13.79|-88.9
GQ|Equatorial Guinea|1.65|10.27
ER|Eritrea|15.18|39.78
EE|Estonia|58.6|25.01
SZ|Eswatini|-26.52|31.47
ET|Ethiopia|9.15|40.49
FJ|Fiji|-17.71|178.07
FI|Finland|61.92|25.75
FR|France|46.23|2.21
GA|Gabon|-0.8|11.61
GM|Gambia|13.44|-15.31
GE|Georgia|42.32|43.36
DE|Germany|51.17|10.45
GH|Ghana|7.95|-1.02
GL|Greenland|71.7|-42.6
GR|Greece|39.07|21.82
GD|Grenada|12.12|-61.68
GT|Guatemala|15.78|-90.23
GN|Guinea|9.95|-9.7
GW|Guinea-Bissau|11.8|-15.18
GY|Guyana|4.86|-58.93
HT|Haiti|18.97|-72.29
HN|Honduras|15.2|-86.24
HK|Hong Kong|22.32|114.17
HU|Hungary|47.16|19.5
IS|Iceland|64.96|-19.02
IN|India|20.59|78.96
ID|Indonesia|-0.79|113.92
IR|Iran|32.43|53.69
IQ|Iraq|33.22|43.68
IE|Ireland|53.41|-8.24
IL|Israel|31.05|34.85
IT|Italy|41.87|12.57
JM|Jamaica|18.11|-77.3
JP|Japan|36.2|138.25
JO|Jordan|30.59|36.24
KZ|Kazakhstan|48.02|66.92
KE|Kenya|-0.02|37.91
KI|Kiribati|1.87|-157.36
XK|Kosovo|42.6|20.9
KW|Kuwait|29.31|47.48
KG|Kyrgyzstan|41.2|74.77
LA|Laos|19.86|102.5
LV|Latvia|56.88|24.6
LB|Lebanon|33.85|35.86
LS|Lesotho|-29.61|28.23
LR|Liberia|6.43|-9.43
LY|Libya|26.34|17.23
LI|Liechtenstein|47.17|9.56
LT|Lithuania|55.17|23.88
LU|Luxembourg|49.82|6.13
MO|Macau|22.2|113.54
MG|Madagascar|-18.77|46.87
MW|Malawi|-13.25|34.3
MY|Malaysia|4.21|101.98
MV|Maldives|3.2|73.22
ML|Mali|17.57|-4.0
MT|Malta|35.94|14.38
MH|Marshall Islands|7.13|171.18
MR|Mauritania|21.0|-10.94
MU|Mauritius|-20.35|57.55
MX|Mexico|23.63|-102.55
FM|Micronesia|7.43|150.55
MD|Moldova|47.41|28.37
MC|Monaco|43.74|7.42
MN|Mongolia|46.86|103.85
ME|Montenegro|42.71|19.37
MA|Morocco|31.79|-7.09
MZ|Mozambique|-18.67|35.53
MM|Myanmar|21.91|95.96
NA|Namibia|-22.96|18.49
NR|Nauru|-0.52|166.93
NP|Nepal|28.39|84.12
NL|Netherlands|52.13|5.29
NZ|New Zealand|-40.9|174.89
NI|Nicaragua|12.87|-85.21
NE|Niger|17.61|8.08
NG|Nigeria|9.08|8.68
KP|North Korea|40.34|127.51
MK|North Macedonia|41.61|21.75
NO|Norway|60.47|8.47
OM|Oman|21.51|55.92
PK|Pakistan|30.38|69.35
PW|Palau|7.51|134.58
PS|Palestine|31.95|35.23
PA|Panama|8.54|-80.78
PG|Papua New Guinea|-6.31|143.96
PY|Paraguay|-23.44|-58.44
PE|Peru|-9.19|-75.02
PH|Philippines|12.88|121.77
PL|Poland|51.92|19.15
PT|Portugal|39.4|-8.22
PR|Puerto Rico|18.22|-66.59
QA|Qatar|25.35|51.18
RO|Romania|45.94|24.97
RU|Russia|61.52|105.32
RW|Rwanda|-1.94|29.87
KN|Saint Kitts and Nevis|17.36|-62.78
LC|Saint Lucia|13.91|-60.98
VC|Saint Vincent and the Grenadines|12.98|-61.29
WS|Samoa|-13.76|-172.1
SM|San Marino|43.94|12.46
ST|São Tomé and Príncipe|0.19|6.61
SA|Saudi Arabia|23.89|45.08
SN|Senegal|14.5|-14.45
RS|Serbia|44.02|21.01
SC|Seychelles|-4.68|55.49
SL|Sierra Leone|8.46|-11.78
SG|Singapore|1.35|103.82
SK|Slovakia|48.67|19.7
SI|Slovenia|46.15|14.99
SB|Solomon Islands|-9.65|160.16
SO|Somalia|5.15|46.2
ZA|South Africa|-30.56|22.94
KR|South Korea|35.91|127.77
SS|South Sudan|6.88|31.31
ES|Spain|40.46|-3.75
LK|Sri Lanka|7.87|80.77
SD|Sudan|12.86|30.22
SR|Suriname|3.92|-56.03
SE|Sweden|60.13|18.64
CH|Switzerland|46.82|8.23
SY|Syria|34.8|39.0
TW|Taiwan|23.7|120.96
TJ|Tajikistan|38.86|71.28
TZ|Tanzania|-6.37|34.89
TH|Thailand|15.87|100.99
TL|Timor-Leste|-8.87|125.73
TG|Togo|8.62|0.82
TO|Tonga|-21.18|-175.2
TT|Trinidad and Tobago|10.69|-61.22
TN|Tunisia|33.89|9.54
TR|Türkiye|38.96|35.24
TM|Turkmenistan|38.97|59.56
TV|Tuvalu|-7.11|177.65
UG|Uganda|1.37|32.29
UA|Ukraine|48.38|31.17
AE|United Arab Emirates|23.42|53.85
GB|United Kingdom|55.38|-3.44
US|United States|37.09|-95.71
UY|Uruguay|-32.52|-55.77
UZ|Uzbekistan|41.38|64.59
VU|Vanuatu|-15.38|166.96
VA|Vatican City|41.9|12.45
VE|Venezuela|6.42|-66.59
VN|Vietnam|14.06|108.28
YE|Yemen|15.55|48.52
ZM|Zambia|-13.13|27.85
ZW|Zimbabwe|-19.02|29.15
`;

export const COUNTRIES = RAW.trim().split('\n').map((line) => {
  const [code, name, lat, lng] = line.split('|');
  return { code, name, lat: Number(lat), lng: Number(lng) };
});

export const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

// Other names people type when searching.
export const ALIASES = {
  TR: 'turkey', US: 'usa america united states of america', GB: 'uk england scotland wales great britain britain',
  CI: 'ivory coast cote divoire', CZ: 'czech republic', NL: 'holland', MM: 'burma', SZ: 'swaziland',
  KR: 'korea republic of korea', KP: 'korea dprk', CD: 'congo democratic republic drc', CG: 'congo brazzaville',
  AE: 'uae emirates', VA: 'holy see', CV: 'cape verde', MK: 'macedonia', PS: 'gaza west bank',
  RU: 'russian federation', LA: 'lao', SY: 'syrian', IR: 'persia', ST: 'sao tome and principe',
  TL: 'east timor', BN: 'brunei darussalam', FM: 'federated states of micronesia', MO: 'macao',
};

/** Country code -> flag emoji via regional indicator symbols (XK has no official flag glyph). */
export function flag(code) {
  if (code === 'XK') return '🇽🇰';
  return String.fromCodePoint(...[...code].map((ch) => 0x1f1a5 + ch.charCodeAt(0)));
}

// How far (in degrees) a pin may be scattered from a country's centre point,
// so pins from the same country don't stack and nobody's exact location is stored.
const SPREAD = {
  RU: 10, CA: 7, US: 6, CN: 6, BR: 6, AU: 6, KZ: 5, AR: 4, IN: 4, DZ: 4, ID: 4, MN: 4, GL: 4,
  MX: 3, SA: 3, CD: 3, LY: 3, SD: 3, IR: 3, ML: 3, NE: 3, TD: 3, PE: 2.5, AO: 2.5, ZA: 2.5,
  EG: 2.5, CO: 2, NG: 2, TZ: 2, ET: 2, MR: 2.5, BO: 2, CL: 1.5, TR: 2, FR: 1.5, ES: 1.5,
  DE: 1, SE: 2, NO: 2, FI: 1.5, JP: 1.5, PK: 2, MM: 1.5, TH: 1.2, VN: 1.2, KE: 1.2, UA: 1.5, PL: 1,
  SG: 0.05, MT: 0.05, MC: 0.02, VA: 0.01, SM: 0.03, LI: 0.05, AD: 0.08, BH: 0.1, MV: 0.3,
  MU: 0.15, SC: 0.2, KM: 0.15, BB: 0.05, AG: 0.08, DM: 0.08, GD: 0.05, LC: 0.07, VC: 0.07,
  KN: 0.07, ST: 0.1, NR: 0.02, TV: 0.2, PW: 0.2, MH: 0.5, FM: 0.5, TO: 0.2, WS: 0.15,
  KI: 0.5, HK: 0.08, MO: 0.03, LU: 0.2, CY: 0.3, QA: 0.2, KW: 0.25, BN: 0.2, LB: 0.2,
  PS: 0.15, XK: 0.2, ME: 0.3, SZ: 0.3, DJ: 0.3, GM: 0.3, TT: 0.15, JM: 0.3, PR: 0.3,
};
const DEFAULT_SPREAD = 0.6;

/** Returns a slightly scattered lat/lng near a country's centre. */
export function scatter(country) {
  const s = SPREAD[country.code] ?? DEFAULT_SPREAD;
  const lat = country.lat + (Math.random() * 2 - 1) * s;
  const lngScale = 1 / Math.max(Math.cos((country.lat * Math.PI) / 180), 0.2);
  let lng = country.lng + (Math.random() * 2 - 1) * s * Math.min(lngScale, 2);
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;
  return {
    lat: Math.max(-85, Math.min(85, Number(lat.toFixed(4)))),
    lng: Number(lng.toFixed(4)),
  };
}
