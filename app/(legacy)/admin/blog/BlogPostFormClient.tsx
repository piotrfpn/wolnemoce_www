"use client";

import { type ReactNode, useRef, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  uploadBlogContentImage,
  type BlogPostFormState,
} from "./actions";
import {
  buildContentImageBlock,
  buildGfmTable,
  buildGfmTableFromTsv,
  type BlogImageSize,
} from "@/lib/blogContent";

type BlogPostFormValues = {
  id?: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  status?: string | null;
  author_name?: string | null;
  featured_image_path?: string | null;
  featured_image_alt?: string | null;
  tags?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

type BlogPostFormClientProps = {
  action: (
    state: BlogPostFormState,
    formData: FormData
  ) => Promise<BlogPostFormState>;
  post?: BlogPostFormValues;
  featuredImageUrl?: string | null;
};

const initialState: BlogPostFormState = {};

const blogCategories = [
  "Poradnik",
  "Case study",
  "Aktualności",
  "Outsourcing produkcji",
  "Wolne moce produkcyjne",
  "Obróbka CNC i metal",
  "Tworzywa sztuczne",
  "Automatyka i robotyzacja",
  "Magazynowanie i logistyka",
  "Jakość i certyfikacja",
  "Koszty i optymalizacja",
  "Prawo i umowy B2B",
  "Trendy przemysłowe",
];

const MIN_TABLE_COLUMNS = 1;
const MAX_TABLE_COLUMNS = 8;
const MIN_TABLE_ROWS = 1;
const MAX_TABLE_ROWS = 20;

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-xs leading-5 text-slate-500">{children}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Zapisywanie..." : "Zapisz wpis"}
    </button>
  );
}

export default function BlogPostFormClient({
  action,
  post,
  featuredImageUrl,
}: BlogPostFormClientProps) {
  const [state, formAction] = useFormState(action, initialState);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const [contentImageAlt, setContentImageAlt] = useState("");
  const [contentImageSize, setContentImageSize] = useState<BlogImageSize>("large");
  const [contentImageMessage, setContentImageMessage] = useState("");
  const [isContentImageUploading, startContentImageUpload] = useTransition();
  const [tableColumns, setTableColumns] = useState(3);
  const [tableRowCount, setTableRowCount] = useState(4);
  const [tableHeaders, setTableHeaders] = useState(["", "", ""]);
  const [tableCells, setTableCells] = useState(
    Array.from({ length: 4 }, () => ["", "", ""])
  );
  const [tableMessage, setTableMessage] = useState("");
  const [pastedTable, setPastedTable] = useState("");
  const [pastedTableMessage, setPastedTableMessage] = useState("");

  function insertContentAtCursor(block: string) {
    const textarea = contentTextareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? start;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const leadingSeparator = before && !before.endsWith("\n\n") ? "\n\n" : "";
    const trailingSeparator = after && !after.startsWith("\n\n") ? "\n\n" : "";
    const nextValue = `${before}${leadingSeparator}${block}${trailingSeparator}${after}`;
    const cursorPosition = before.length + leadingSeparator.length + block.length;

    textarea.value = nextValue;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  }

  function handleContentImageUpload() {
    const file = contentImageInputRef.current?.files?.[0];
    const alt = contentImageAlt.trim();

    if (!file) {
      setContentImageMessage("Wybierz obraz do wgrania.");
      return;
    }

    if (!alt) {
      setContentImageMessage("Podaj tekst alternatywny zdjęcia.");
      return;
    }

    const formData = new FormData();
    formData.set("content_image", file);
    setContentImageMessage("");

    startContentImageUpload(async () => {
      const result = await uploadBlogContentImage(formData);

      if (result.error || !result.path) {
        setContentImageMessage(result.error ?? "Nie udało się wgrać obrazu.");
        return;
      }

      const imageBlock = buildContentImageBlock(alt, result.path, contentImageSize);

      if (!imageBlock) {
        setContentImageMessage("Nie udało się przygotować bezpiecznego bloku obrazu.");
        return;
      }

      insertContentAtCursor(imageBlock);
      setContentImageAlt("");
      if (contentImageInputRef.current) {
        contentImageInputRef.current.value = "";
      }
      setContentImageMessage("Obraz został wstawiony do treści.");
    });
  }

  function resizeTable(nextColumnsValue: number, nextRowsValue: number) {
    const nextColumns = Math.min(
      MAX_TABLE_COLUMNS,
      Math.max(MIN_TABLE_COLUMNS, Number.isFinite(nextColumnsValue) ? nextColumnsValue : tableColumns)
    );
    const nextRows = Math.min(
      MAX_TABLE_ROWS,
      Math.max(MIN_TABLE_ROWS, Number.isFinite(nextRowsValue) ? nextRowsValue : tableRowCount)
    );

    setTableColumns(nextColumns);
    setTableRowCount(nextRows);
    setTableHeaders((current) =>
      Array.from({ length: nextColumns }, (_, index) => current[index] ?? "")
    );
    setTableCells((current) =>
      Array.from({ length: nextRows }, (_, rowIndex) =>
        Array.from(
          { length: nextColumns },
          (_, columnIndex) => current[rowIndex]?.[columnIndex] ?? ""
        )
      )
    );
  }

  function updateTableHeader(index: number, value: string) {
    setTableHeaders((current) =>
      current.map((header, headerIndex) =>
        headerIndex === index ? value : header
      )
    );
  }

  function updateTableCell(rowIndex: number, columnIndex: number, value: string) {
    setTableCells((current) =>
      current.map((row, currentRowIndex) =>
        currentRowIndex === rowIndex
          ? row.map((cell, currentColumnIndex) =>
              currentColumnIndex === columnIndex ? value : cell
            )
          : row
      )
    );
  }

  function handleInsertTable() {
    if (tableHeaders.some((header) => !header.trim())) {
      setTableMessage("Uzupełnij wszystkie nagłówki tabeli.");
      return;
    }

    insertContentAtCursor(buildGfmTable(tableHeaders, tableCells));
    setTableMessage("Tabela została wstawiona do treści.");
  }

  function handleInsertPastedTable() {
    const table = buildGfmTableFromTsv(pastedTable);

    if (!table) {
      setPastedTableMessage(
        "Wklej tabelę z nagłówkami, maksymalnie 8 kolumn i 20 wierszy danych."
      );
      return;
    }

    insertContentAtCursor(table);
    setPastedTable("");
    setPastedTableMessage("Tabela została wstawiona do treści.");
  }

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}
      {post?.slug ? (
        <input type="hidden" name="previous_slug" value={post.slug} />
      ) : null}

      {state.error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Tytuł wpisu
          </span>
          <input
            name="title"
            required
            defaultValue={post?.title ?? ""}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Slug / adres URL
          </span>
          <input
            name="slug"
            defaultValue={post?.slug ?? ""}
            placeholder="np. jak-efektywnie-outsourcingowac-produkcje"
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
          <FieldHint>
            Opcjonalnie. Jeśli zostawisz puste, system utworzy adres
            automatycznie z tytułu, np. jak-efektywnie-outsourcingowac-produkcje.
          </FieldHint>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Status
          </span>
          <select
            name="status"
            defaultValue={post?.status ?? "draft"}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Kategoria
          </span>
          <select
            name="category"
            defaultValue={post?.category ?? "Poradnik"}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          >
            {blogCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Autor
          </span>
          <input
            name="author_name"
            defaultValue={post?.author_name ?? "WolneMoce"}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Tagi
          </span>
          <input
            name="tags"
            defaultValue={post?.tags?.join(", ") ?? ""}
            placeholder="CNC, outsourcing, produkcja seryjna"
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
          <FieldHint>
            Wpisz po przecinku, bez znaku #, np. CNC, outsourcing, produkcja
            seryjna.
          </FieldHint>
        </label>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Zdjęcie przewodnie
            </span>
            <input
              type="file"
              name="featured_image"
              accept="image/jpeg,image/png,image/webp"
              className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 file:mr-4 file:rounded-full file:border-0 file:bg-[#1a5f3c] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
            />
          </label>
          <FieldHint>
            JPG, PNG lub WebP. Maksymalnie 5 MB. Jeśli nie dodasz zdjęcia,
            publiczny blog użyje graficznego fallbacku.
          </FieldHint>
          {featuredImageUrl ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
              <img
                src={featuredImageUrl}
                alt={post?.featured_image_alt || post?.title || "Zdjęcie wpisu"}
                className="h-48 w-full max-w-full rounded-lg object-cover"
              />
            </div>
          ) : post?.featured_image_path ? (
            <p className="mt-3 text-xs text-slate-500">
              Aktualne zdjęcie: {post.featured_image_path}
            </p>
          ) : null}
        </div>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Tekst alternatywny zdjęcia
          </span>
          <input
            name="featured_image_alt"
            defaultValue={post?.featured_image_alt ?? ""}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
          <FieldHint>Krótki opis zdjęcia dla dostępności i SEO.</FieldHint>
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Krótki opis / excerpt
          </span>
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt ?? ""}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Treść wpisu
          </span>
          <textarea
            ref={contentTextareaRef}
            name="content"
            required
            rows={16}
            defaultValue={post?.content ?? ""}
            placeholder="Wpisz treść artykułu. Puste linie utworzą odstępy między akapitami."
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Wstaw zdjęcie</h2>
            <FieldHint>
              Obraz zostanie zapisany w bezpiecznym bucketcie bloga i wstawiony w aktualnej pozycji kursora w treści.
            </FieldHint>
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-[1fr_1fr_180px_auto] md:items-end">
            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Plik obrazu
              </span>
              <input
                ref={contentImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 file:mr-4 file:rounded-full file:border-0 file:bg-[#1a5f3c] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
              />
            </label>

            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Rozmiar obrazu
              </span>
              <select
                value={contentImageSize}
                onChange={(event) => setContentImageSize(event.target.value as BlogImageSize)}
                className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:ring-4 focus:ring-[#1a5f3c]/10"
              >
                <option value="small">Małe</option>
                <option value="medium">Średnie</option>
                <option value="large">Duże</option>
                <option value="full">Pełna szerokość</option>
              </select>
            </label>

            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Tekst ALT
              </span>
              <input
                value={contentImageAlt}
                onChange={(event) => setContentImageAlt(event.target.value)}
                placeholder="Krótki opis obrazu"
                className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:ring-4 focus:ring-[#1a5f3c]/10"
              />
            </label>

            <button
              type="button"
              onClick={handleContentImageUpload}
              disabled={isContentImageUploading}
              className="btn btn-primary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isContentImageUploading ? "Wgrywanie..." : "Wgraj i wstaw"}
            </button>
          </div>

          {contentImageMessage ? (
            <p className="mt-3 text-sm text-slate-600">{contentImageMessage}</p>
          ) : null}
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Wklej tabelę z Excel / Google Sheets</h2>
            <FieldHint>
              Wklej zakres z arkusza. Pierwszy wiersz będzie nagłówkiem; obsługiwane jest maksymalnie 8 kolumn i 20 wierszy danych.
            </FieldHint>
          </div>

          <textarea
            value={pastedTable}
            onChange={(event) => setPastedTable(event.target.value)}
            rows={5}
            placeholder={"Nagłówek 1\tNagłówek 2\nWartość 1\tWartość 2"}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:ring-4 focus:ring-[#1a5f3c]/10"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={handleInsertPastedTable} className="btn btn-primary w-full sm:w-auto">
              Wstaw wklejoną tabelę
            </button>
            {pastedTableMessage ? <p className="text-sm text-slate-600">{pastedTableMessage}</p> : null}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Wstaw tabelę</h2>
            <FieldHint>
              Uzupełnij nagłówki i komórki, a tabela zostanie wstawiona w aktualnej pozycji kursora.
            </FieldHint>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Liczba kolumn
              </span>
              <input
                type="number"
                min={MIN_TABLE_COLUMNS}
                max={MAX_TABLE_COLUMNS}
                value={tableColumns}
                onChange={(event) => resizeTable(Number(event.target.value), tableRowCount)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:ring-4 focus:ring-[#1a5f3c]/10"
              />
            </label>

            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Liczba wierszy danych
              </span>
              <input
                type="number"
                min={MIN_TABLE_ROWS}
                max={MAX_TABLE_ROWS}
                value={tableRowCount}
                onChange={(event) => resizeTable(tableColumns, Number(event.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:ring-4 focus:ring-[#1a5f3c]/10"
              />
            </label>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-max w-full border-collapse text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  {tableHeaders.map((header, index) => (
                    <th key={`header-${index}`} className="min-w-[160px] border-b border-slate-200 p-3">
                      <input
                        value={header}
                        onChange={(event) => updateTableHeader(index, event.target.value)}
                        placeholder={`Nagłówek ${index + 1}`}
                        aria-label={`Nagłówek kolumny ${index + 1}`}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-[#1a5f3c]"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableCells.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, columnIndex) => (
                      <td key={`cell-${rowIndex}-${columnIndex}`} className="border-b border-slate-100 p-3 last:border-b-0">
                        <input
                          value={cell}
                          onChange={(event) => updateTableCell(rowIndex, columnIndex, event.target.value)}
                          aria-label={`Wiersz ${rowIndex + 1}, kolumna ${columnIndex + 1}`}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#1a5f3c]"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={handleInsertTable} className="btn btn-primary w-full sm:w-auto">
              Wstaw tabelę
            </button>
            {tableMessage ? <p className="text-sm text-slate-600">{tableMessage}</p> : null}
          </div>
        </div>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Meta title SEO
          </span>
          <input
            name="meta_title"
            defaultValue={post?.meta_title ?? ""}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
          <FieldHint>
            Opcjonalny tytuł dla Google i karty przeglądarki. Jeśli puste,
            użyty będzie tytuł wpisu.
          </FieldHint>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Meta description SEO
          </span>
          <input
            name="meta_description"
            defaultValue={post?.meta_description ?? ""}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
          <FieldHint>
            Opcjonalny opis dla Google. Jeśli puste, użyty będzie krótki opis
            wpisu.
          </FieldHint>
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton />
      </div>
    </form>
  );
}
