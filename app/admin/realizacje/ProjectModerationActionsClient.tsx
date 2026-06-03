"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import {
  archiveCompanyProject,
  publishCompanyProject,
  rejectCompanyProject,
  updateCompanyProjectAdminNote,
  type ProjectModerationActionResult,
} from "./actions";
import type { CompanyProjectStatus } from "./types";

type ProjectModerationActionsClientProps = {
  projectId: string;
  status: CompanyProjectStatus;
  adminNotes: string | null;
  compact?: boolean;
};

export default function ProjectModerationActionsClient({
  projectId,
  status,
  adminNotes,
  compact = false,
}: ProjectModerationActionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState(adminNotes ?? "");
  const [result, setResult] = useState<ProjectModerationActionResult>({});

  function runAction(action: () => Promise<ProjectModerationActionResult>) {
    setResult({});
    startTransition(async () => {
      const nextResult = await action();
      setResult(nextResult);

      if (nextResult.success) {
        router.refresh();
      }
    });
  }

  function handlePublish() {
    if (
      !window.confirm(
        "Opublikować tę realizację?\nPo publikacji będzie mogła zostać pokazana w profilu firmy w kolejnym etapie."
      )
    ) {
      return;
    }

    runAction(() => publishCompanyProject(projectId));
  }

  function handleArchive() {
    if (
      !window.confirm(
        "Zarchiwizować tę realizację?\nRealizacja zostanie ukryta i nie będzie publikowana."
      )
    ) {
      return;
    }

    runAction(() => archiveCompanyProject(projectId));
  }

  function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !window.confirm(
        "Odrzucić tę realizację?\nNotatka admina jest wewnętrzna i nie będzie widoczna dla firmy."
      )
    ) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("adminNotes", note);
    runAction(() => rejectCompanyProject(formData));
  }

  function handleNoteSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("adminNotes", note);
    runAction(() => updateCompanyProjectAdminNote(formData));
  }

  const canPublish = status === "pending" || status === "rejected";
  const canReject = status === "pending";
  const canArchive = status !== "archived";

  return (
    <div className="space-y-4">
      {result.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      ) : null}

      {result.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {result.success}
        </div>
      ) : null}

      {!compact ? (
        <form onSubmit={handleNoteSave} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Notatka admina
            </span>
            <textarea
              name="adminNotes"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Notatka wewnętrzna. Nie będzie widoczna dla firmy."
              className="min-h-[140px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10"
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#1a5f3c] hover:text-[#1a5f3c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="fas fa-floppy-disk"></i>
            Zapisz notatkę
          </button>
        </form>
      ) : null}

      <div className="grid min-w-0 gap-2">
        {canPublish ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handlePublish}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a5f3c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0d3d26] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="fas fa-check"></i>
            Opublikuj
          </button>
        ) : null}

        {canReject ? (
          <form onSubmit={handleReject}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="adminNotes" value={note} />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-4 py-3 text-sm font-bold text-red-700 transition hover:border-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className="fas fa-xmark"></i>
              Odrzuć
            </button>
          </form>
        ) : null}

        {canArchive ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handleArchive}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="fas fa-box-archive"></i>
            Archiwizuj
          </button>
        ) : null}
      </div>
    </div>
  );
}
