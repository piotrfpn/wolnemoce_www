"use client";

import { useState, useTransition } from "react";
import { archiveBlogPost, deleteBlogPost } from "./actions";

export default function BlogPostActionsClient({
  postId,
  slug,
}: {
  postId: string;
  slug: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function runArchive() {
    setError("");
    startTransition(async () => {
      try {
        await archiveBlogPost(postId, slug);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Nie udało się zarchiwizować wpisu."
        );
      }
    });
  }

  function runDelete() {
    if (!window.confirm("Czy na pewno usunąć ten wpis blogowy?")) {
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await deleteBlogPost(postId, slug);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Nie udało się usunąć wpisu."
        );
      }
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runArchive}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Archiwizuj
        </button>
        <button
          type="button"
          onClick={runDelete}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Usuń
        </button>
      </div>
    </div>
  );
}
