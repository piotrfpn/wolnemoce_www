"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProjectActionsClientProps = {
  projectId: string;
  status: string | null;
};

export default function ProjectActionsClient({
  projectId,
  status,
}: ProjectActionsClientProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);
  const canArchive = status !== "archived";

  async function handleArchive() {
    const confirmed = window.confirm(
      "Czy na pewno chcesz zarchiwizować tę realizację? Nie będzie widoczna publicznie."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setIsArchiving(true);

    const supabase = createClient();
    const { error: archiveError } = await supabase
      .from("company_projects")
      .update({ status: "archived" })
      .eq("id", projectId);

    if (archiveError) {
      setError(archiveError.message);
      setIsArchiving(false);
      return;
    }

    router.refresh();
  }

  if (!canArchive) {
    return null;
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={handleArchive}
        disabled={isArchiving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <i className="fas fa-box-archive"></i>
        {isArchiving ? "Archiwizowanie..." : "Archiwizuj"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
