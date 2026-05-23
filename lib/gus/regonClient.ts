import "server-only";

import { isGusMockNip } from "@/lib/gus/mockNips";
import { normalizeNip } from "@/lib/validators/nip";

export type GusPkdCode = {
  code: string;
  name: string | null;
  isPrimary: boolean;
};

export type GusCompany = {
  name: string | null;
  nip: string | null;
  regon: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  street: string | null;
  buildingNumber: string | null;
  apartmentNumber: string | null;
  fullAddress: string | null;
  krs: string | null;
  legalForm: string | null;
  businessStatus: string | null;
  primaryPkd: string | null;
  pkdCodes: GusPkdCode[];
  rawSource: "gus";
};

export class GusConfigError extends Error {
  constructor() {
    super("Integracja GUS nie jest jeszcze skonfigurowana.");
  }
}

export class GusApiError extends Error {
  constructor(message = "Nie udało się pobrać danych z GUS.") {
    super(message);
  }
}

const defaultGusApiUrl =
  "https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc";
const requestTimeoutMs = 12000;
const gusDebugEnabled = process.env.GUS_DEBUG === "true";

function isProductionEnvironment() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function isGusMockLookupAllowed(input: string) {
  const nip = normalizeNip(input);

  return (
    process.env.GUS_MOCK_MODE === "true" &&
    !isProductionEnvironment() &&
    isGusMockNip(nip)
  );
}

function getMockGusCompany(nip: string): GusCompany {
  const mockCompanies: Record<string, GusCompany> = {
    "0000000000": {
      name: "Mock Produkcja Testowa Sp. z o.o.",
      nip,
      regon: "000000000",
      city: "Poznań",
      region: "Wielkopolskie",
      postalCode: "60-001",
      street: "Testowa",
      buildingNumber: "1",
      apartmentNumber: "2",
      fullAddress: "ul. Testowa 1/2, 60-001 Poznań",
      krs: null,
      legalForm: "Spółka z ograniczoną odpowiedzialnością",
      businessStatus: "Aktywna",
      primaryPkd: "25.62.Z - Obróbka mechaniczna elementów metalowych",
      pkdCodes: [
        {
          code: "25.62.Z",
          name: "Obróbka mechaniczna elementów metalowych",
          isPrimary: true,
        },
      ],
      rawSource: "gus",
    },
    "1111111111": {
      name: "Mock Logistyka Testowa Sp. z o.o.",
      nip,
      regon: "111111111",
      city: "Wrocław",
      region: "Dolnośląskie",
      postalCode: "50-001",
      street: "Przykładowa",
      buildingNumber: "10",
      apartmentNumber: null,
      fullAddress: "ul. Przykładowa 10, 50-001 Wrocław",
      krs: null,
      legalForm: "Spółka z ograniczoną odpowiedzialnością",
      businessStatus: "Aktywna",
      primaryPkd: "52.29.C - Działalność pozostałych agencji transportowych",
      pkdCodes: [
        {
          code: "52.29.C",
          name: "Działalność pozostałych agencji transportowych",
          isPrimary: true,
        },
      ],
      rawSource: "gus",
    },
  };

  return mockCompanies[nip];
}

function getGusConfig() {
  const apiKey = process.env.GUS_API_KEY?.trim();
  const apiUrl =
    process.env.GUS_REGON_API_URL?.trim() || defaultGusApiUrl;

  if (!apiKey) {
    throw new GusConfigError();
  }

  return { apiKey, apiUrl };
}

function logGusDiagnostic(
  stage: string,
  details: Record<string, string | number | boolean | null>
) {
  if (!gusDebugEnabled) {
    return;
  }

  console.info("[GUS]", stage, details);
}

async function postSoap(
  apiUrl: string,
  body: string,
  action: string,
  sid?: string
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": `application/soap+xml; charset=utf-8; action="${action}"`,
        ...(sid ? { sid } : {}),
      },
      body,
      signal: controller.signal,
    });

    logGusDiagnostic("soap-response", {
      action,
      httpStatus: response.status,
      ok: response.ok,
      hasSid: Boolean(sid),
      sidLength: sid?.length ?? 0,
    });

    if (!response.ok) {
      throw new GusApiError(`GUS zwrócił status ${response.status}.`);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof GusConfigError || error instanceof GusApiError) {
      throw error;
    }

    logGusDiagnostic("soap-error", {
      action,
      hasSid: Boolean(sid),
      sidLength: sid?.length ?? 0,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

    throw new GusApiError();
  } finally {
    clearTimeout(timeout);
  }
}

function extractTag(xml: string, tagName: string) {
  const pattern = new RegExp(
    `<(?:[\\w-]+:)?${tagName}[^>]*>([\\s\\S]*?)<\\/(?:[\\w-]+:)?${tagName}>`,
    "i"
  );
  const match = xml.match(pattern);

  return match?.[1]?.trim() ?? "";
}

function extractTags(xml: string, tagName: string) {
  const pattern = new RegExp(
    `<(?:[\\w-]+:)?${tagName}[^>]*>([\\s\\S]*?)<\\/(?:[\\w-]+:)?${tagName}>`,
    "gi"
  );
  const matches = xml.matchAll(pattern);

  return Array.from(matches, (match) => match[1]?.trim() ?? "");
}

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function getField(xml: string, fieldName: string) {
  const value = decodeXml(extractTag(xml, fieldName));
  return value ? value.trim() : null;
}

function getFirstField(xml: string, fieldNames: string[]) {
  for (const fieldName of fieldNames) {
    const value = getField(xml, fieldName);

    if (value) {
      return value;
    }
  }

  return null;
}

function normalizePkdCode(value: string | null) {
  if (!value) {
    return null;
  }

  const compactValue = value.replace(/\s+/g, "").toUpperCase();

  if (/^\d{4}[A-Z]$/.test(compactValue)) {
    return `${compactValue.slice(0, 2)}.${compactValue.slice(2, 4)}.${compactValue.slice(4)}`;
  }

  return value;
}

function formatPkdLabel(code: string | null, name: string | null) {
  if (!code && !name) {
    return null;
  }

  const normalizedCode = normalizePkdCode(code);

  if (normalizedCode && name) {
    return `${normalizedCode} - ${name}`;
  }

  return normalizedCode ?? name;
}

function formatStreet(value: string | null) {
  if (!value) {
    return null;
  }

  return /^(ul\.|al\.|pl\.|os\.)\s/i.test(value) ? value : `ul. ${value}`;
}

function buildStreetAddress(
  street: string | null,
  buildingNumber: string | null,
  apartmentNumber: string | null
) {
  const formattedStreet = formatStreet(street);
  const number = buildingNumber
    ? `${buildingNumber}${apartmentNumber ? `/${apartmentNumber}` : ""}`
    : apartmentNumber
      ? `/${apartmentNumber}`
      : "";

  return [formattedStreet, number].filter(Boolean).join(" ") || null;
}

function buildFullAddress({
  street,
  buildingNumber,
  apartmentNumber,
  postalCode,
  city,
}: {
  street: string | null;
  buildingNumber: string | null;
  apartmentNumber: string | null;
  postalCode: string | null;
  city: string | null;
}) {
  const streetAddress = buildStreetAddress(street, buildingNumber, apartmentNumber);
  const postalAddress = [postalCode, city].filter(Boolean).join(" ");

  return [streetAddress, postalAddress].filter(Boolean).join(", ") || null;
}

function buildLoginEnvelope(apiKey: string, apiUrl: string) {
  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing">
  <s:Header>
    <a:Action s:mustUnderstand="1">http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj</a:Action>
    <a:To s:mustUnderstand="1">${apiUrl}</a:To>
  </s:Header>
  <s:Body>
    <Zaloguj xmlns="http://CIS/BIR/PUBL/2014/07">
      <pKluczUzytkownika>${apiKey}</pKluczUzytkownika>
    </Zaloguj>
  </s:Body>
</s:Envelope>`;
}

function buildSearchEnvelope(nip: string, apiUrl: string) {
  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:ns="http://CIS/BIR/PUBL/2014/07" xmlns:dat="http://CIS/BIR/PUBL/2014/07/DataContract">
  <s:Header>
    <a:Action s:mustUnderstand="1">http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty</a:Action>
    <a:To s:mustUnderstand="1">${apiUrl}</a:To>
  </s:Header>
  <s:Body>
    <ns:DaneSzukajPodmioty>
      <ns:pParametryWyszukiwania>
        <dat:Nip>${nip}</dat:Nip>
      </ns:pParametryWyszukiwania>
    </ns:DaneSzukajPodmioty>
  </s:Body>
</s:Envelope>`;
}

function buildGetValueEnvelope(parameterName: string, apiUrl: string) {
  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing">
  <s:Header>
    <a:Action s:mustUnderstand="1">http://CIS/BIR/2014/07/IUslugaBIR/GetValue</a:Action>
    <a:To s:mustUnderstand="1">${apiUrl}</a:To>
  </s:Header>
  <s:Body>
    <GetValue xmlns="http://CIS/BIR/2014/07">
      <pNazwaParametru>${parameterName}</pNazwaParametru>
    </GetValue>
  </s:Body>
</s:Envelope>`;
}

function buildFullReportEnvelope(regon: string, reportName: string, apiUrl: string) {
  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:ns="http://CIS/BIR/PUBL/2014/07">
  <s:Header>
    <a:Action s:mustUnderstand="1">http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DanePobierzPelnyRaport</a:Action>
    <a:To s:mustUnderstand="1">${apiUrl}</a:To>
  </s:Header>
  <s:Body>
    <ns:DanePobierzPelnyRaport>
      <ns:pRegon>${regon}</ns:pRegon>
      <ns:pNazwaRaportu>${reportName}</ns:pNazwaRaportu>
    </ns:DanePobierzPelnyRaport>
  </s:Body>
</s:Envelope>`;
}

async function loginToGus() {
  const { apiKey, apiUrl } = getGusConfig();
  const xml = await postSoap(
    apiUrl,
    buildLoginEnvelope(apiKey, apiUrl),
    "http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj"
  );
  const sid = decodeXml(extractTag(xml, "ZalogujResult"));

  if (!sid) {
    throw new GusApiError();
  }

  logGusDiagnostic("login", {
    hasSid: true,
    sidLength: sid.length,
  });

  return { sid, apiUrl };
}

async function getGusValue(apiUrl: string, sid: string, parameterName: string) {
  const xml = await postSoap(
    apiUrl,
    buildGetValueEnvelope(parameterName, apiUrl),
    "http://CIS/BIR/2014/07/IUslugaBIR/GetValue",
    sid
  );

  return decodeXml(extractTag(xml, "GetValueResult"));
}

async function logEmptySearchDiagnostics(apiUrl: string, sid: string) {
  const parameterNames = [
    "KomunikatKod",
    "KomunikatTresc",
    "StatusSesji",
    "StanDanych",
  ];
  const values: Record<string, string> = {};

  try {
    for (const parameterName of parameterNames) {
      values[parameterName] = await getGusValue(apiUrl, sid, parameterName);
    }

    logGusDiagnostic("empty-search-result", values);
  } catch (error) {
    logGusDiagnostic("get-value-error", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
  }
}

async function getFullReportXml(apiUrl: string, sid: string, regon: string, reportName: string) {
  const xml = await postSoap(
    apiUrl,
    buildFullReportEnvelope(regon, reportName, apiUrl),
    "http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DanePobierzPelnyRaport",
    sid
  );
  const reportXml = decodeXml(extractTag(xml, "DanePobierzPelnyRaportResult"));
  const hasGusError = Boolean(getField(reportXml, "ErrorCode"));

  logGusDiagnostic("full-report", {
    reportName,
    hasResult: Boolean(reportXml),
    hasGusError,
  });

  return reportXml && !hasGusError ? reportXml : "";
}

function mapBusinessStatus(reportXml: string, type: string | null) {
  const prefix = type === "F" ? "fiz" : "praw";
  const endDate = getFirstField(reportXml, [
    `${prefix}_dataZakonczeniaDzialalnosci`,
    `${prefix}_dataSkresleniazRegon`,
    `${prefix}_dataSkresleniazRegonDzialalnosci`,
  ]);
  const suspendedDate = getField(reportXml, `${prefix}_dataZawieszeniaDzialalnosci`);
  const resumedDate = getField(reportXml, `${prefix}_dataWznowieniaDzialalnosci`);

  if (endDate) {
    return "Zakończona";
  }

  if (suspendedDate && !resumedDate) {
    return "Zawieszona";
  }

  return "Aktywna";
}

function mapPkdCodes(pkdReportXml: string): GusPkdCode[] {
  const records = extractTags(decodeXml(pkdReportXml), "dane");
  const sourceRecords = records.length > 0 ? records : [pkdReportXml];

  return sourceRecords
    .map((record) => {
      const code = normalizePkdCode(
        getFirstField(record, ["praw_pkdKod", "fiz_pkd_Kod", "fiz_pkdKod"])
      );
      const name = getFirstField(record, ["praw_pkdNazwa", "fiz_pkd_Nazwa", "fiz_pkdNazwa"]);
      const primaryFlag = getFirstField(record, [
        "praw_pkdPrzewazajace",
        "fiz_pkd_Przewazajace",
        "fiz_pkdPrzewazajace",
      ]);

      if (!code) {
        return null;
      }

      return {
        code,
        name,
        isPrimary: primaryFlag === "1",
      };
    })
    .filter((code): code is GusPkdCode => Boolean(code));
}

function mapGusSearchResult(
  rawXml: string,
  fallbackNip: string,
  reportXml = "",
  pkdReportXml = ""
): GusCompany | null {
  const decodedXml = decodeXml(rawXml);
  const firstRecord = extractTag(decodedXml, "dane") || decodedXml;
  const name = getField(firstRecord, "Nazwa");
  const regon = getField(firstRecord, "Regon");
  const type = getField(firstRecord, "Typ");

  if (!name && !regon) {
    return null;
  }

  const sourceRecord = decodeXml(reportXml) || firstRecord;
  const city =
    getFirstField(sourceRecord, [
      "praw_adSiedzMiejscowosc_Nazwa",
      "fiz_adSiedzMiejscowosc_Nazwa",
    ]) ?? getField(firstRecord, "Miejscowosc");
  const region =
    getFirstField(sourceRecord, [
      "praw_adSiedzWojewodztwo_Nazwa",
      "fiz_adSiedzWojewodztwo_Nazwa",
    ]) ?? getField(firstRecord, "Wojewodztwo");
  const postalCode =
    getFirstField(sourceRecord, [
      "praw_adSiedzKodPocztowy",
      "fiz_adSiedzKodPocztowy",
    ]) ?? getField(firstRecord, "KodPocztowy");
  const street =
    getFirstField(sourceRecord, [
      "praw_adSiedzUlica_Nazwa",
      "fiz_adSiedzUlica_Nazwa",
    ]) ?? getField(firstRecord, "Ulica");
  const buildingNumber =
    getFirstField(sourceRecord, [
      "praw_adSiedzNumerNieruchomosci",
      "fiz_adSiedzNumerNieruchomosci",
    ]) ?? getField(firstRecord, "NrNieruchomosci");
  const apartmentNumber =
    getFirstField(sourceRecord, [
      "praw_adSiedzNumerLokalu",
      "fiz_adSiedzNumerLokalu",
    ]) ?? getField(firstRecord, "NrLokalu");
  const pkdCodes = mapPkdCodes(pkdReportXml);
  const primaryPkdCode = pkdCodes.find((code) => code.isPrimary) ?? pkdCodes[0];

  return {
    name,
    nip: getField(firstRecord, "Nip") ?? fallbackNip,
    regon,
    city,
    region,
    postalCode,
    street: buildStreetAddress(street, buildingNumber, apartmentNumber),
    buildingNumber,
    apartmentNumber,
    fullAddress: buildFullAddress({
      street,
      buildingNumber,
      apartmentNumber,
      postalCode,
      city,
    }),
    krs:
      type === "P"
        ? getFirstField(sourceRecord, ["praw_numerWrejestrzeEwidencji"])
        : null,
    legalForm: getFirstField(sourceRecord, [
      "praw_szczegolnaFormaPrawna_Nazwa",
      "praw_podstawowaFormaPrawna_Nazwa",
      "fiz_szczegolnaFormaPrawna_Nazwa",
      "fiz_podstawowaFormaPrawna_Nazwa",
    ]),
    businessStatus: sourceRecord !== firstRecord ? mapBusinessStatus(sourceRecord, type) : null,
    primaryPkd: primaryPkdCode
      ? formatPkdLabel(primaryPkdCode.code, primaryPkdCode.name)
      : null,
    pkdCodes,
    rawSource: "gus",
  };
}

export async function searchGusByNip(input: string) {
  const nip = normalizeNip(input);

  if (isGusMockLookupAllowed(nip)) {
    return getMockGusCompany(nip);
  }

  const { sid, apiUrl } = await loginToGus();
  const xml = await postSoap(
    apiUrl,
    buildSearchEnvelope(nip, apiUrl),
    "http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty",
    sid
  );
  const resultXml = extractTag(xml, "DaneSzukajPodmiotyResult");

  if (!resultXml) {
    await logEmptySearchDiagnostics(apiUrl, sid);
    return null;
  }

  const decodedResultXml = decodeXml(resultXml);
  const firstRecord = extractTag(decodedResultXml, "dane") || decodedResultXml;
  const regon = getField(firstRecord, "Regon");
  const type = getField(firstRecord, "Typ");
  let reportXml = "";
  let pkdReportXml = "";

  if (regon && type) {
    const mainReportName =
      type === "F" ? "BIR11OsFizycznaDaneOgolne" : "BIR11OsPrawna";
    const activityReportNames =
      type === "F"
        ? [
            "BIR11OsFizycznaDzialalnoscCeidg",
            "BIR11OsFizycznaDzialalnoscRolnicza",
            "BIR11OsFizycznaDzialalnoscPozostala",
          ]
        : [];
    const pkdReportName =
      type === "F" ? "BIR11OsFizycznaPkd" : "BIR11OsPrawnaPkd";

    const mainReportXml = await getFullReportXml(apiUrl, sid, regon, mainReportName);
    let activityReportXml = "";

    for (const activityReportName of activityReportNames) {
      const nextActivityReportXml = await getFullReportXml(
        apiUrl,
        sid,
        regon,
        activityReportName
      );

      if (nextActivityReportXml) {
        activityReportXml = nextActivityReportXml;
        break;
      }
    }

    reportXml = `${mainReportXml}${activityReportXml}`;
    pkdReportXml = await getFullReportXml(apiUrl, sid, regon, pkdReportName);
  }

  return mapGusSearchResult(resultXml, nip, reportXml, pkdReportXml);
}
