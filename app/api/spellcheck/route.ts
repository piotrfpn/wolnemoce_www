import { NextResponse, type NextRequest } from "next/server";
import {
  isIndustrialTermOrCode,
  type SpellcheckMatch,
} from "@/lib/polishAutocorrect";
import { createClient } from "@/lib/supabase/server";

const MAX_TEXT_LENGTH = 5000;
const LANGUAGETOOL_ENDPOINT = "https://api.languagetool.org/v2/check";

const LANGUAGE_MAP: Record<string, string> = {
  pl: "pl-PL",
  en: "en-US",
  de: "de-DE",
  es: "es",
  fr: "fr",
  uk: "uk-UA",
};

const IGNORED_RULE_IDS = new Set([
  "UPPERCASE_SENTENCE_START",
  "WHITESPACE_RULE",
  "COMMA_PARENTHESIS_WHITESPACE",
  "PUNCTUATION_PARAGRAPH_END",
  "BRAK_SPACJI",
]);

type LanguageToolRawMatch = {
  offset?: unknown;
  length?: unknown;
  message?: unknown;
  replacements?: Array<{ value?: unknown }>;
  rule?: {
    id?: unknown;
    issueType?: unknown;
  };
};

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ matches: [] }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      text?: unknown;
      locale?: unknown;
    } | null;

    const rawText = typeof body?.text === "string" ? body.text : "";
    const text = rawText.slice(0, MAX_TEXT_LENGTH);

    if (text.trim().length < 2) {
      return NextResponse.json({ matches: [] });
    }

    const localeKey =
      typeof body?.locale === "string" ? body.locale.toLowerCase() : "pl";
    const language = LANGUAGE_MAP[localeKey] ?? "pl-PL";

    const params = new URLSearchParams();
    params.set("text", text);
    params.set("language", language);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let ltResponse: Response;
    try {
      ltResponse = await fetch(LANGUAGETOOL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: params.toString(),
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!ltResponse.ok) {
      return NextResponse.json({ matches: [] });
    }

    const data = (await ltResponse.json().catch(() => null)) as {
      matches?: LanguageToolRawMatch[];
    } | null;

    const rawMatches = Array.isArray(data?.matches) ? data.matches : [];
    const matches: SpellcheckMatch[] = [];

    for (const item of rawMatches) {
      const offset = typeof item.offset === "number" ? item.offset : -1;
      const length = typeof item.length === "number" ? item.length : 0;
      const ruleId = typeof item.rule?.id === "string" ? item.rule.id : "";
      const issueType =
        typeof item.rule?.issueType === "string"
          ? item.rule.issueType
          : "misspelling";

      if (offset < 0 || length <= 0 || offset + length > text.length) {
        continue;
      }

      if (IGNORED_RULE_IDS.has(ruleId)) {
        continue;
      }

      // Focus on real spelling & typo issues so technical Polish text stays clean
      if (
        issueType !== "misspelling" &&
        issueType !== "typographical" &&
        issueType !== "grammar"
      ) {
        continue;
      }

      const word = text.slice(offset, offset + length);
      if (isIndustrialTermOrCode(word)) {
        continue;
      }

      const replacements = Array.isArray(item.replacements)
        ? item.replacements
            .map((rep) => (typeof rep?.value === "string" ? rep.value : ""))
            .filter((rep) => rep.length > 0 && rep !== word)
            .slice(0, 4)
        : [];

      const message =
        typeof item.message === "string" && item.message.trim().length > 0
          ? item.message
          : "Możliwy błąd pisowni";

      matches.push({
        offset,
        length,
        word,
        message,
        replacements,
        issueType,
        ruleId,
      });
    }

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
