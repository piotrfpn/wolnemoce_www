"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  autocorrectFullPolishText,
  autocorrectWordBeforeCursor,
  type AutocorrectReplacement,
  type SpellcheckMatch,
} from "@/lib/polishAutocorrect";

type PolishProofreadTextareaProps = {
  id?: string;
  value: string;
  onChange: (nextValue: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  locale?: string;
};

type HighlightSegment = {
  text: string;
  isError: boolean;
  key: string;
};

function buildHighlightSegments(
  text: string,
  matches: SpellcheckMatch[]
): HighlightSegment[] {
  if (!text) return [];
  if (matches.length === 0) {
    return [{ text, isError: false, key: "plain-0" }];
  }

  const sorted = [...matches].sort((a, b) => a.offset - b.offset);
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const match of sorted) {
    const start = Math.max(match.offset, cursor);
    const end = Math.min(match.offset + match.length, text.length);
    if (start >= end) continue;

    if (start > cursor) {
      segments.push({
        text: text.slice(cursor, start),
        isError: false,
        key: `plain-${cursor}`,
      });
    }

    segments.push({
      text: text.slice(start, end),
      isError: true,
      key: `err-${start}-${end}`,
    });

    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      isError: false,
      key: `plain-${cursor}`,
    });
  }

  return segments;
}

export default function PolishProofreadTextarea({
  id,
  value,
  onChange,
  rows = 6,
  placeholder,
  disabled = false,
  locale = "pl",
}: PolishProofreadTextareaProps) {
  const isPolish = locale === "pl";
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const latestValueRef = useRef(value);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(true);
  const [matches, setMatches] = useState<SpellcheckMatch[]>([]);
  const [ignoredWords, setIgnoredWords] = useState<string[]>([]);
  const [recentCorrections, setRecentCorrections] = useState<
    AutocorrectReplacement[]
  >([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  latestValueRef.current = value;

  const syncScroll = useCallback(() => {
    if (!textareaRef.current || !backdropRef.current) return;
    backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }, []);

  const recordCorrections = useCallback((items: AutocorrectReplacement[]) => {
    if (items.length === 0) return;
    setRecentCorrections((current) => {
      const merged = [...items, ...current];
      const seen = new Set<string>();
      const unique: AutocorrectReplacement[] = [];
      for (const item of merged) {
        const key = `${item.from.toLowerCase()}->${item.to.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
        if (unique.length >= 5) break;
      }
      return unique;
    });
  }, []);

  const runSpellcheck = useCallback(
    async (textToCheck: string) => {
      if (disabled || textToCheck.trim().length < 2) {
        setMatches([]);
        setIsChecking(false);
        setHasChecked(false);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsChecking(true);
      try {
        const response = await fetch("/api/spellcheck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToCheck, locale }),
          signal: controller.signal,
        });

        if (!response.ok) {
          if (latestValueRef.current === textToCheck) {
            setMatches([]);
          }
          return;
        }

        const data = (await response.json()) as {
          matches?: SpellcheckMatch[];
        };

        if (latestValueRef.current === textToCheck) {
          setMatches(Array.isArray(data.matches) ? data.matches : []);
          setHasChecked(true);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (latestValueRef.current === textToCheck) {
          setMatches([]);
        }
      } finally {
        if (abortControllerRef.current === controller) {
          setIsChecking(false);
        }
      }
    },
    [disabled, locale]
  );

  // Debounced spellcheck whenever text changes
  useEffect(() => {
    if (disabled || value.trim().length < 2) {
      setMatches([]);
      setHasChecked(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      runSpellcheck(value);
    }, 650);

    return () => clearTimeout(timeoutId);
  }, [value, disabled, runSpellcheck]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const visibleMatches = useMemo(() => {
    if (matches.length === 0) return [];
    const ignoredSet = new Set(
      ignoredWords.map((word) => word.toLocaleLowerCase("pl-PL"))
    );
    return matches.filter((match) => {
      if (match.offset + match.length > value.length) return false;
      const currentSlice = value.slice(match.offset, match.offset + match.length);
      if (currentSlice !== match.word) return false;
      return !ignoredSet.has(match.word.toLocaleLowerCase("pl-PL"));
    });
  }, [matches, ignoredWords, value]);

  const highlightSegments = useMemo(
    () => buildHighlightSegments(value, visibleMatches),
    [value, visibleMatches]
  );

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const rawValue = event.target.value;
    const cursorPos = event.target.selectionStart ?? rawValue.length;

    // Clear stale underline positions immediately while user edits
    if (matches.length > 0) {
      setMatches([]);
    }

    const isInsertion = rawValue.length > value.length;

    if (isPolish && autoCorrectEnabled && isInsertion) {
      const corrected = autocorrectWordBeforeCursor(rawValue, cursorPos);
      if (corrected.replacement) {
        recordCorrections([corrected.replacement]);
        onChange(corrected.text);
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(
              corrected.cursorPosition,
              corrected.cursorPosition
            );
            syncScroll();
          }
        });
        return;
      }
    }

    onChange(rawValue);
    requestAnimationFrame(syncScroll);
  }

  function handleBlur() {
    if (!isPolish || !autoCorrectEnabled || disabled || !value.trim()) {
      return;
    }

    const { text, replacements } = autocorrectFullPolishText(value);
    if (replacements.length > 0 && text !== value) {
      recordCorrections(replacements);
      onChange(text);
    }
  }

  function handleManualProofread() {
    if (disabled || !value.trim()) return;

    let textToCheck = value;
    if (isPolish && autoCorrectEnabled) {
      const { text, replacements } = autocorrectFullPolishText(value);
      if (replacements.length > 0 && text !== value) {
        recordCorrections(replacements);
        onChange(text);
        textToCheck = text;
      }
    }

    runSpellcheck(textToCheck);
  }

  function applySuggestion(match: SpellcheckMatch, replacement: string) {
    const currentSlice = value.slice(match.offset, match.offset + match.length);
    if (currentSlice !== match.word) return;

    const updated =
      value.slice(0, match.offset) +
      replacement +
      value.slice(match.offset + match.length);

    recordCorrections([{ from: match.word, to: replacement }]);
    setMatches([]);
    onChange(updated);
    textareaRef.current?.focus();
  }

  function ignoreWord(word: string) {
    setIgnoredWords((current) => [...current, word]);
  }

  return (
    <div className="min-w-0 w-full">
      <div
        className={`relative min-w-0 w-full overflow-hidden rounded-xl border transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100"
            : visibleMatches.length > 0
              ? "border-red-300 bg-slate-50 focus-within:border-[#1a5f3c] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1a5f3c]/10"
              : "border-slate-200 bg-slate-50 focus-within:border-[#1a5f3c] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1a5f3c]/10"
        }`}
      >
        {/* Synchronized backdrop rendering red wavy underlines directly under misspelled words */}
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3 text-sm leading-6 text-transparent"
        >
          {highlightSegments.map((segment) =>
            segment.isError ? (
              <mark
                key={segment.key}
                className="rounded-[3px] bg-red-100/85 text-transparent underline decoration-red-500 decoration-wavy decoration-2 underline-offset-[3px]"
              >
                {segment.text}
              </mark>
            ) : (
              <span key={segment.key}>{segment.text}</span>
            )
          )}
          {value.endsWith("\n") ? "\n " : null}
        </div>

        <textarea
          id={id}
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onScroll={syncScroll}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          spellCheck={true}
          lang={locale}
          className="relative z-10 block min-w-0 max-w-full w-full resize-y bg-transparent px-4 py-3 text-sm leading-6 text-slate-800 caret-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
        />
      </div>

      {/* Compact proofreading status & controls bar */}
      {!disabled ? (
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {isPolish ? (
                <button
                  type="button"
                  onClick={() => setAutoCorrectEnabled((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold transition ${
                    autoCorrectEnabled
                      ? "border-emerald-200 bg-emerald-50 text-[#1a5f3c] hover:bg-emerald-100"
                      : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <i className="fas fa-wand-magic-sparkles text-[11px]"></i>
                  {autoCorrectEnabled
                    ? "Autokorekta: WŁ."
                    : "Autokorekta: WYŁ."}
                </button>
              ) : null}

              {isChecking ? (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <i className="fas fa-spinner fa-spin text-[11px] text-[#1a5f3c]"></i>
                  {isPolish ? "Sprawdzanie pisowni..." : "Checking spelling..."}
                </span>
              ) : visibleMatches.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-red-600">
                  <i className="fas fa-circle-exclamation text-[11px]"></i>
                  {isPolish
                    ? `Do poprawy: ${visibleMatches.length}`
                    : `Issues found: ${visibleMatches.length}`}
                </span>
              ) : hasChecked && value.trim().length >= 2 ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-[#1a5f3c]">
                  <i className="fas fa-circle-check text-[11px]"></i>
                  {isPolish ? "Pisownia wygląda dobrze" : "Spelling looks good"}
                </span>
              ) : null}

              {recentCorrections.length > 0 ? (
                <span className="text-slate-500">
                  {isPolish ? "Poprawiono:" : "Fixed:"}{" "}
                  <span className="font-medium text-slate-700">
                    {recentCorrections
                      .slice(0, 3)
                      .map((item) => `${item.from} → ${item.to}`)
                      .join(", ")}
                  </span>
                </span>
              ) : null}
            </div>

            {value.trim().length >= 2 ? (
              <button
                type="button"
                onClick={handleManualProofread}
                disabled={isChecking}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 transition hover:border-[#1a5f3c] hover:text-[#1a5f3c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i className="fas fa-spell-check text-[11px]"></i>
                {isPolish ? "Sprawdź pisownię" : "Check spelling"}
              </button>
            ) : null}
          </div>

          {/* Clickable red-underlined error list with 1-click suggestions */}
          {visibleMatches.length > 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs">
              <p className="mb-2 font-bold text-red-700">
                {isPolish
                  ? "Podkreślone słowa wymagają poprawy — kliknij propozycję albo popraw ręcznie:"
                  : "Highlighted words may need correction — click a suggestion or edit manually:"}
              </p>
              <div className="space-y-2">
                {visibleMatches.map((match) => (
                  <div
                    key={`${match.offset}-${match.word}`}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-red-100 bg-white px-2.5 py-2"
                  >
                    <span className="font-bold text-red-700 underline decoration-red-500 decoration-wavy underline-offset-2">
                      {match.word}
                    </span>
                    <span className="text-slate-400">→</span>
                    {match.replacements.length > 0 ? (
                      match.replacements.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => applySuggestion(match, suggestion)}
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white"
                        >
                          {suggestion}
                        </button>
                      ))
                    ) : (
                      <span className="text-slate-500">
                        {isPolish
                          ? "brak automatycznej propozycji — popraw ręcznie"
                          : "no automatic suggestion — edit manually"}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => ignoreWord(match.word)}
                      className="ml-auto text-[11px] font-medium text-slate-400 transition hover:text-slate-700"
                    >
                      {isPolish ? "Ignoruj" : "Ignore"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
