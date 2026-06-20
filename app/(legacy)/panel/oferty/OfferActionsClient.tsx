"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { OFFER_IMAGES_BUCKET } from "@/lib/offerImageUploads";
import { createClient } from "@/lib/supabase/client";
import { deleteOfferWithImagesAction } from "./actions";

import type { PanelCommonDictionary } from "@/lib/i18n/types";

type OfferActionsClientProps = {
  offerId: string;
  status: string | null;
  dict: PanelCommonDictionary;
};

export default function OfferActionsClient({
  offerId,
  status,
  dict,
}: OfferActionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canArchive = status !== "archived";

  async function handleArchive() {
    const confirmed = window.confirm(
      "Czy na pewno chcesz zarchiwizować tę ofertę? Oferta nie będzie widoczna publicznie."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsArchiving(true);

    const supabase = createClient();
    const { error: archiveError } = await supabase
      .from("offers")
      .update({ status: "archived" })
      .eq("id", offerId);

    if (archiveError) {
      setError(archiveError.message);
      setIsArchiving(false);
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć tę ofertę? Tej operacji nie można cofnąć."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsDeleting(true);

    const result = await deleteOfferWithImagesAction({ offerId });

    if (!result.success) {
      if (result.errorKey === "offerDeleteBlockedHasInquiries") {
        setError("Nie można usunąć oferty, do której wysłano zapytania RFQ.");
      } else {
        setError("Nie udało się usunąć oferty.");
      }
      setIsDeleting(false);
      return;
    }

    startTransition(() => {
      router.push("/panel/oferty");
      router.refresh();
    });
  }

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 flex-col gap-2">
        {canArchive ? (
          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving || isDeleting || isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <i className="fas fa-box-archive"></i>
            {isArchiving ? "Archiwizowanie..." : dict.archive}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isArchiving || isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <i className="fas fa-trash"></i>
          {isDeleting || isPending ? "Usuwanie..." : dict.delete}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
