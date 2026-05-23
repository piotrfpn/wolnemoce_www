"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { OFFER_IMAGES_BUCKET } from "@/lib/offerImageUploads";
import { createClient } from "@/lib/supabase/client";

type OfferActionsClientProps = {
  offerId: string;
  status: string | null;
};

export default function OfferActionsClient({
  offerId,
  status,
}: OfferActionsClientProps) {
  const router = useRouter();
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

    const supabase = createClient();
    const { data: images, error: imagesError } = await supabase
      .from("offer_images")
      .select("path")
      .eq("offer_id", offerId);

    if (imagesError) {
      setError(imagesError.message);
      setIsDeleting(false);
      return;
    }

    const imagePaths = (images ?? [])
      .map((image) => image.path as string | null)
      .filter((path): path is string => Boolean(path));

    if (imagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(OFFER_IMAGES_BUCKET)
        .remove(imagePaths);

      if (storageError) {
        setError("Nie udało się usunąć zdjęć oferty ze Storage.");
        setIsDeleting(false);
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from("offers")
      .delete()
      .eq("id", offerId);

    if (deleteError) {
      setError(deleteError.message);
      setIsDeleting(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 flex-col gap-2">
        {canArchive ? (
          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving || isDeleting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <i className="fas fa-box-archive"></i>
            {isArchiving ? "Archiwizowanie..." : "Archiwizuj"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isArchiving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <i className="fas fa-trash"></i>
          {isDeleting ? "Usuwanie..." : "Usuń"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
