import "server-only";

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

function getGusConfig() {
  const apiKey = process.env.GUS_REGON_API_KEY?.trim();
  const apiUrl =
    process.env.GUS_REGON_API_URL?.trim() || defaultGusApiUrl;

  if (!apiKey) {
    throw new GusConfigError();
  }

  return { apiKey, apiUrl };
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

    if (!response.ok) {
      throw new GusApiError(`GUS zwrócił status ${response.status}.`);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof GusConfigError || error instanceof GusApiError) {
      throw error;
    }

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
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing">
  <s:Header>
    <a:Action s:mustUnderstand="1">http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty</a:Action>
    <a:To s:mustUnderstand="1">${apiUrl}</a:To>
  </s:Header>
  <s:Body>
    <DaneSzukajPodmioty xmlns="http://CIS/BIR/PUBL/2014/07">
      <pParametryWyszukiwania>
        <Nip>${nip}</Nip>
      </pParametryWyszukiwania>
    </DaneSzukajPodmioty>
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

  return { sid, apiUrl };
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
  const { sid, apiUrl } = await loginToGus();
  const xml = await postSoap(
    apiUrl,
    buildSearchEnvelope(nip, apiUrl),
    "http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty",
    sid
  );
  const resultXml = extractTag(xml, "DaneSzukajPodmiotyResult");

  if (!resultXml) {
    return null;
  }

  return mapGusSearchResult(resultXml, nip);
}
