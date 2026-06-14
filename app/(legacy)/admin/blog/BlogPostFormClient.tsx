"use client";

import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { BlogPostFormState } from "./actions";

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
            name="content"
            required
            rows={16}
            defaultValue={post?.content ?? ""}
            placeholder="Wpisz treść artykułu. Puste linie utworzą odstępy między akapitami."
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
          />
        </label>

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
