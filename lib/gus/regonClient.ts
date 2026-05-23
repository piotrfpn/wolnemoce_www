import "server-only";

import { isGusMockNip } from "@/lib/gus/mockNips";
import { normalizeNip } from "@/lib/validators/nip";

export type GusCompany = {
  name: string | null;
  nip: string | null;
  regon: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  street: string | null;
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

function mapGusSearchResult(rawXml: string, fallbackNip: string): GusCompany | null {
  const decodedXml = decodeXml(rawXml);
  const firstRecord = extractTag(decodedXml, "dane") || decodedXml;
  const name = getField(firstRecord, "Nazwa");
  const regon = getField(firstRecord, "Regon");

  if (!name && !regon) {
    return null;
  }

  return {
    name,
    nip: getField(firstRecord, "Nip") ?? fallbackNip,
    regon,
    city: getField(firstRecord, "Miejscowosc"),
    region: getField(firstRecord, "Wojewodztwo"),
    postalCode: getField(firstRecord, "KodPocztowy"),
    street: getField(firstRecord, "Ulica"),
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

  return mapGusSearchResult(resultXml, nip);
}
