export type AutocorrectReplacement = {
  from: string;
  to: string;
};

export type SpellcheckMatch = {
  offset: number;
  length: number;
  word: string;
  message: string;
  replacements: string[];
  issueType: string;
  ruleId: string;
};

/**
 * Unambiguous Polish words commonly typed without diacritics or with frequent typos.
 * Every entry maps a lowercase word -> exact Polish lowercase replacement.
 * Ambiguous words (e.g. "ze" = preposition "ze stali", "sa" = "S.A.", "moze" vs "morze")
 * are intentionally excluded so autocorrect never corrupts valid Polish text.
 */
const UNAMBIGUOUS_POLISH_CORRECTIONS: Record<string, string> = {
  // Common function words & particles
  sie: "się",
  mnostwo: "mnóstwo",
  juz: "już",
  tez: "też",
  rowniez: "również",
  takze: "także",
  poniewaz: "ponieważ",
  dzieki: "dzięki",
  bedzie: "będzie",
  beda: "będą",
  bedziemy: "będziemy",
  bede: "będę",
  bedziesz: "będziesz",
  moge: "mogę",
  mozna: "można",
  mozemy: "możemy",
  mozliwosc: "możliwość",
  mozliwosci: "możliwości",
  mozliwosciami: "możliwościami",
  wiecej: "więcej",
  wiekszosc: "większość",
  wiekszosci: "większości",
  wieksze: "większe",
  wiekszy: "większy",
  wieksza: "większa",
  wiekszych: "większych",
  miedzy: "między",
  wsrod: "wśród",
  zarowno: "zarówno",
  glownie: "głównie",
  zwlaszcza: "zwłaszcza",
  szczegolnie: "szczególnie",
  ogolnie: "ogólnie",
  wlasny: "własny",
  wlasna: "własna",
  wlasne: "własne",
  wlasnych: "własnych",
  wlasnym: "własnym",
  wlasnej: "własnej",
  kazdy: "każdy",
  kazda: "każda",
  kazde: "każde",
  kazdym: "każdym",
  kazdej: "każdej",
  ktory: "który",
  ktora: "która",
  ktore: "które",
  ktorych: "których",
  ktorym: "którym",
  ktorej: "której",
  ktorego: "którego",
  ktorymi: "którymi",
  rozny: "różny",
  rozna: "różna",
  rozne: "różne",
  roznych: "różnych",
  roznym: "różnym",
  roznorodnych: "różnorodnych",
  ciagle: "ciągle",
  biezaco: "bieżąco",
  zaleznie: "zależnie",
  niezaleznie: "niezależnie",
  chetnie: "chętnie",
  checia: "chęcią",
  pelny: "pełny",
  pelna: "pełna",
  pelne: "pełne",
  pelnej: "pełnej",
  pelnych: "pełnych",
  pelnym: "pełnym",
  duzy: "duży",
  duza: "duża",
  duze: "duże",
  duzych: "dużych",
  duzym: "dużym",
  duzej: "dużej",
  maly: "mały",
  mala: "mała",
  male: "małe",
  malych: "małych",
  malym: "małym",
  malej: "małej",
  sredni: "średni",
  srednia: "średnia",
  srednie: "średnie",
  srednich: "średnich",
  krotki: "krótki",
  krotka: "krótka",
  krotkie: "krótkie",
  krotkich: "krótkich",
  krotkim: "krótkim",
  dlugi: "długi",
  dluga: "długa",
  dlugie: "długie",
  dlugich: "długich",
  dlugoterminowa: "długoterminowa",
  dlugoterminowej: "długoterminowej",
  dlugoterminowe: "długoterminowe",
  wszytko: "wszystko",
  rownie: "równie",
  wciaz: "wciąż",
  poki: "póki",
  pozniej: "później",
  wczesniej: "wcześniej",
  natychmiastowo: "natychmiastowo",
  zawsze: "zawsze",
  czesto: "często",
  czesciej: "częściej",
  najczesciej: "najczęściej",
  rownolegle: "równolegle",
  wlacznie: "włącznie",
  wylacznie: "wyłącznie",

  // Business, manufacturing & WolneMoce domain terms
  swiadczymy: "świadczymy",
  swiadcze: "świadczę",
  wspolpraca: "współpraca",
  wspolpracy: "współpracy",
  wspolprace: "współpracę",
  wspolpracujemy: "współpracujemy",
  jakosc: "jakość",
  jakosci: "jakości",
  jakoscia: "jakością",
  ilosc: "ilość",
  ilosci: "ilości",
  ilosciami: "ilościami",
  dostepnosc: "dostępność",
  dostepnosci: "dostępności",
  dostepny: "dostępny",
  dostepna: "dostępna",
  dostepne: "dostępne",
  dostepnych: "dostępnych",
  dostepnym: "dostępnym",
  obrobka: "obróbka",
  obrobki: "obróbki",
  obrobke: "obróbkę",
  obrobce: "obróbce",
  ciecie: "cięcie",
  ciecia: "cięcia",
  giecie: "gięcie",
  giecia: "gięcia",
  tloczenie: "tłoczenie",
  tloczenia: "tłoczenia",
  montaz: "montaż",
  montazu: "montażu",
  montazem: "montażem",
  urzadzenie: "urządzenie",
  urzadzenia: "urządzenia",
  urzadzen: "urządzeń",
  urzadzeniami: "urządzeniami",
  czesc: "część",
  czesci: "części",
  czesciami: "częściami",
  elementow: "elementów",
  material: "materiał",
  materialy: "materiały",
  materialow: "materiałów",
  materialem: "materiałem",
  materialami: "materiałami",
  narzedzie: "narzędzie",
  narzedzia: "narzędzia",
  narzedzi: "narzędzi",
  narzedziownia: "narzędziownia",
  narzedziowni: "narzędziowni",
  powloka: "powłoka",
  powloki: "powłoki",
  powlok: "powłok",
  zlecenie: "zlecenie",
  zlecen: "zleceń",
  zamowienie: "zamówienie",
  zamowienia: "zamówienia",
  zamowien: "zamówień",
  zamowieniu: "zamówieniu",
  terminowosc: "terminowość",
  terminowosci: "terminowości",
  doswiadczenie: "doświadczenie",
  doswiadczeniem: "doświadczeniem",
  doswiadczeniu: "doświadczeniu",
  doswiadczony: "doświadczony",
  doswiadczona: "doświadczona",
  dokladnosc: "dokładność",
  dokladnosci: "dokładności",
  dokladnoscią: "dokładnością",
  dokladnoscia: "dokładnością",
  dokladne: "dokładne",
  dokladny: "dokładny",
  wykonczenie: "wykończenie",
  wykonczenia: "wykończenia",
  wykonczeniem: "wykończeniem",
  wysylka: "wysyłka",
  wysylki: "wysyłki",
  wysylke: "wysyłkę",
  przemyslowy: "przemysłowy",
  przemyslowa: "przemysłowa",
  przemyslowe: "przemysłowe",
  przemyslowych: "przemysłowych",
  przemyslu: "przemysłu",
  branza: "branża",
  branzy: "branży",
  branz: "branż",
  branzach: "branżach",
  usluga: "usługa",
  uslugi: "usługi",
  uslug: "usług",
  uslugowe: "usługowe",
  uslugowych: "usługowych",
  uslugowy: "usługowy",
  miesiecznie: "miesięcznie",
  tygodniowo: "tygodniowo",
  dziennie: "dziennie",
  zaklad: "zakład",
  zakladu: "zakładu",
  zakladzie: "zakładzie",
  zespol: "zespół",
  zespolu: "zespołu",
  zespolem: "zespołem",
  klientow: "klientów",
  projektow: "projektów",
  produktow: "produktów",
  wyrobow: "wyrobów",
  konstrukcji: "konstrukcji",
  rozwiazania: "rozwiązania",
  rozwiazan: "rozwiązań",
  rozwiazanie: "rozwiązanie",
  szczegoly: "szczegóły",
  szczegolow: "szczegółów",
  szczegolowy: "szczegółowy",
  szczegolowa: "szczegółowa",
  sprzet: "sprzęt",
  sprzetu: "sprzętu",
  sprzetem: "sprzętem",
  wlasciwosci: "właściwości",
  wydajnosc: "wydajność",
  wydajnosci: "wydajności",
  powtarzalnosc: "powtarzalność",
  powtarzalnosci: "powtarzalności",
  elastycznosc: "elastyczność",
  elastycznosci: "elastyczności",
  szybkosc: "szybkość",
  szybkosci: "szybkości",
  ciezar: "ciężar",
  ciezkich: "ciężkich",
  ciezkie: "ciężkie",
  grubosc: "grubość",
  grubosci: "grubości",
  szerokosc: "szerokość",
  szerokosci: "szerokości",
  dlugosc: "długość",
  dlugosci: "długości",
  wysokosc: "wysokość",
  wysokosci: "wysokości",
  srednica: "średnica",
  srednicy: "średnicy",
  wiazki: "wiązki",
  spawalnicze: "spawalnicze",
  slusarskie: "ślusarskie",
  slusarstwo: "ślusarstwo",
  srutowanie: "śrutowanie",
  srutowania: "śrutowania",
  tworzywa: "tworzywa",
  wtrysk: "wtrysk",
  zlacz: "złącz",
  polaczen: "połączeń",
  polaczenia: "połączenia",
  obciazen: "obciążeń",
  obciazenia: "obciążenia",
  wymagan: "wymagań",
  wymagania: "wymagania",
  zastosowan: "zastosowań",
  zastosowania: "zastosowania",
  mozliwych: "możliwych",
  wstepna: "wstępna",
  wstepny: "wstępny",
  wstepne: "wstępne",
  wstepnej: "wstępnej",
  biala: "biała",
  zlota: "złota",
  zolty: "żółty",
  szybka: "szybka",
  rowna: "równa",
  prokektuje: "projektuję",
  prokektuję: "projektuję",
};

/**
 * Common Polish 1st-person "-uję" verbs that users often type without "ę" ("-uje").
 * Replaced with "-uję" unless preceded by a clear 3rd-person subject (e.g. "firma projektuje").
 */
const FIRST_PERSON_UJE_VERBS: Record<string, string> = {
  projektuje: "projektuję",
  oferuje: "oferuję",
  realizuje: "realizuję",
  wykonuje: "wykonuję",
  produkuje: "produkuję",
  montuje: "montuję",
  programuje: "programuję",
  serwisuje: "serwisuję",
  pracuje: "pracuję",
  buduje: "buduję",
  zajmuje: "zajmuję",
  gwarantuje: "gwarantuję",
  przygotowuje: "przygotowuję",
  wspolpracuje: "współpracuję",
  współpracuje: "współpracuję",
  obsluguje: "obsługuję",
  obsługuje: "obsługuję",
  modernizuje: "modernizuję",
  integruje: "integruję",
  testuje: "testuję",
  pakuje: "pakuję",
  magazynuje: "magazynuję",
  transportuje: "transportuję",
  dostarczam: "dostarczam",
};

const THIRD_PERSON_SUBJECTS = new Set([
  "firma",
  "spółka",
  "spolka",
  "zakład",
  "zaklad",
  "zespół",
  "zespol",
  "dział",
  "dzial",
  "biuro",
  "maszyna",
  "linia",
  "system",
  "program",
  "robot",
  "urządzenie",
  "urzadzenie",
  "automat",
  "klient",
  "partner",
  "wykonawca",
  "dostawca",
  "producent",
  "inżynier",
  "inzynier",
  "operator",
  "specjalista",
  "on",
  "ona",
  "ono",
  "ktoś",
  "ktos",
  "każdy",
  "kazdy",
  "który",
  "ktory",
  "która",
  "ktora",
  "które",
  "ktore",
  "co",
  "to",
]);

/**
 * Technical manufacturing / B2B abbreviations and terms that should never be flagged as misspelled.
 */
export const INDUSTRIAL_SPELLCHECK_ALLOWLIST = new Set([
  "cnc",
  "cad",
  "cam",
  "cae",
  "plc",
  "scada",
  "hmi",
  "mig",
  "mag",
  "tig",
  "iso",
  "ce",
  "pn",
  "en",
  "din",
  "astm",
  "b2b",
  "b2c",
  "oem",
  "odm",
  "rfq",
  "pdf",
  "step",
  "stp",
  "iges",
  "igs",
  "dxf",
  "dwg",
  "stl",
  "pvc",
  "abs",
  "pa",
  "pe",
  "pp",
  "pet",
  "pc",
  "pom",
  "ptfe",
  "hdpe",
  "ldpe",
  "esd",
  "smt",
  "tht",
  "pcb",
  "pcba",
  "agv",
  "amr",
  "wms",
  "erp",
  "mes",
  "crm",
  "szt",
  "mies",
  "tyg",
  "godz",
  "mm",
  "cm",
  "kg",
  "kw",
  "mpa",
  "hrc",
  "ra",
  "rz",
  "led",
  "cnc3",
  "cnc5",
  "edm",
  "wedm",
  "laser",
  "fiber",
  "co2",
  "siemens",
  "fanuc",
  "haas",
  "mazak",
  "dmg",
  "mori",
  "trumpf",
  "bystronic",
  "abb",
  "kuka",
  "yaskawa",
  "beckhoff",
  "mitsubishi",
  "omron",
  "allen",
  "bradley",
  "rockwell",
  "solidworks",
  "autocad",
  "inventor",
  "catia",
  "nx",
  "creo",
  "mastercam",
  "wolnemoce",
  "fulfillment",
  "cross-docking",
  "dropshipping",
  "e-commerce",
  "ecommerce",
  "pallet",
  "europalety",
  "europalet",
]);

export function isIndustrialTermOrCode(word: string): boolean {
  const trimmed = word.trim();
  if (!trimmed) return true;

  const lower = trimmed.toLowerCase();
  if (INDUSTRIAL_SPELLCHECK_ALLOWLIST.has(lower)) {
    return true;
  }

  // All-uppercase acronyms or technical codes (e.g. "CNC", "ISO", "S355J2", "316L")
  if (/^[A-Z0-9][A-Z0-9/_-]{1,10}$/.test(trimmed)) {
    return true;
  }

  // Mixed digits + letters (steel grades, tolerances, dimensions: "5-osiowy", "304L", "500szt")
  if (/\d/.test(trimmed)) {
    return true;
  }

  return false;
}

function preserveCase(original: string, replacement: string): string {
  if (!original || !replacement) return replacement;

  // ALL CAPS
  if (
    original.length > 1 &&
    original === original.toLocaleUpperCase("pl-PL") &&
    original !== original.toLocaleLowerCase("pl-PL")
  ) {
    return replacement.toLocaleUpperCase("pl-PL");
  }

  // Capitalized first letter
  const firstChar = original[0];
  if (
    firstChar === firstChar.toLocaleUpperCase("pl-PL") &&
    firstChar !== firstChar.toLocaleLowerCase("pl-PL")
  ) {
    return (
      replacement[0].toLocaleUpperCase("pl-PL") + replacement.slice(1)
    );
  }

  return replacement;
}

function getPreviousWord(textBeforeWord: string): string {
  const match = textBeforeWord.match(
    /([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+)[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]*$/
  );
  return match ? match[1].toLocaleLowerCase("pl-PL") : "";
}

export function getPolishWordCorrection(
  word: string,
  textBeforeWord: string
): string | null {
  const lower = word.toLocaleLowerCase("pl-PL");

  if (lower in UNAMBIGUOUS_POLISH_CORRECTIONS) {
    const corrected = UNAMBIGUOUS_POLISH_CORRECTIONS[lower];
    if (corrected !== lower) {
      return preserveCase(word, corrected);
    }
  }

  if (lower in FIRST_PERSON_UJE_VERBS) {
    const prevWord = getPreviousWord(textBeforeWord);
    // Keep 3rd-person singular when directly preceded by a 3rd-person subject
    if (!prevWord || !THIRD_PERSON_SUBJECTS.has(prevWord)) {
      const corrected = FIRST_PERSON_UJE_VERBS[lower];
      if (corrected !== lower) {
        return preserveCase(word, corrected);
      }
    }
  }

  return null;
}

/**
 * Autocorrects the word right before a newly typed delimiter (space or punctuation)
 * while preserving the user's exact caret position.
 */
export function autocorrectWordBeforeCursor(
  text: string,
  cursorPosition: number
): {
  text: string;
  cursorPosition: number;
  replacement: AutocorrectReplacement | null;
} {
  if (cursorPosition < 2 || cursorPosition > text.length) {
    return { text, cursorPosition, replacement: null };
  }

  const charBeforeCursor = text[cursorPosition - 1];
  if (!/[\s.,;:!?()[\]{}"'/\n\r]/.test(charBeforeCursor)) {
    return { text, cursorPosition, replacement: null };
  }

  const beforeDelimiter = text.slice(0, cursorPosition - 1);
  const wordMatch = beforeDelimiter.match(/([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+)$/);
  if (!wordMatch) {
    return { text, cursorPosition, replacement: null };
  }

  const word = wordMatch[1];
  const wordStart = beforeDelimiter.length - word.length;
  const textBeforeWord = text.slice(0, wordStart);
  const corrected = getPolishWordCorrection(word, textBeforeWord);

  if (!corrected || corrected === word) {
    return { text, cursorPosition, replacement: null };
  }

  const updatedText =
    text.slice(0, wordStart) + corrected + text.slice(wordStart + word.length);
  const delta = corrected.length - word.length;

  return {
    text: updatedText,
    cursorPosition: cursorPosition + delta,
    replacement: { from: word, to: corrected },
  };
}

/**
 * Runs Polish autocorrect across an entire string (used on blur or manual "Popraw pisownię").
 */
export function autocorrectFullPolishText(text: string): {
  text: string;
  replacements: AutocorrectReplacement[];
} {
  const replacements: AutocorrectReplacement[] = [];
  const wordRegex = /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+/g;
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    const start = match.index;
    result += text.slice(lastIndex, start);

    const corrected = getPolishWordCorrection(word, result);
    if (corrected && corrected !== word) {
      replacements.push({ from: word, to: corrected });
      result += corrected;
    } else {
      result += word;
    }

    lastIndex = start + word.length;
  }

  result += text.slice(lastIndex);
  return { text: result, replacements };
}
