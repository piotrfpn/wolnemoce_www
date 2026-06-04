"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  COMPANY_PROJECT_IMAGES_BUCKET,
  MAX_COMPANY_PROJECT_IMAGES,
  createCompanyProjectImageFileName,
  getCompanyProjectImageFileKey,
  getCompanyProjectImagePublicUrl,
  validateCompanyProjectImageFiles,
} from "@/lib/companyProjectImageUploads";
import { createClient } from "@/lib/supabase/client";

type CompanyData = {
  id: string;
  name: string | null;
};

type ProjectStatus = "draft" | "pending" | "published" | "rejected" | "archived";

type ProjectData = {
  id: string;
  company_id: string;
  created_by: string | null;
  title: string;
  slug: string;
  technology: string[];
  industry: string[];
  description: string;
  nda_confirmation: boolean;
  status: ProjectStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type ProjectImageData = {
  id: string;
  project_id: string;
  company_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
};

type ProjectFormClientProps = {
  company: CompanyData;
  project?: ProjectData;
  projectImages?: ProjectImageData[];
  mode: "new" | "edit";
};

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

const statusLabels: Record<ProjectStatus, string> = {
  draft: "Szkic",
  pending: "W moderacji",
  published: "Opublikowana",
  rejected: "Odrzucona",
  archived: "Zarchiwizowana",
};

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return `${normalized || "realizacja"}-${Date.now().toString(36)}`;
}

function parseCommaTags(value: string, maxItems: number): string[] {
  const tags = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(tags)).slice(0, maxItems);
}

function formatImageSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ProjectFormClient({
  company,
  project,
  projectImages = [],
  mode,
}: ProjectFormClientProps) {
  const router = useRouter();
  const currentStatus = project?.status ?? "draft";
  const canSubmitToModeration = currentStatus !== "archived";

  const [title, setTitle] = useState(project?.title ?? "");
  const [technologyInput, setTechnologyInput] = useState(
    project?.technology.join(", ") ?? ""
  );
  const [industryInput, setIndustryInput] = useState(
    project?.industry.join(", ") ?? ""
  );
  const [description, setDescription] = useState(project?.description ?? "");
  const [ndaConfirmation, setNdaConfirmation] = useState(
    project?.nda_confirmation ?? false
  );
  const [existingImages, setExistingImages] = useState<ProjectImageData[]>(
    [...projectImages].sort((a, b) => a.display_order - b.display_order)
  );
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<
    { fileKey: string; url: string }[]
  >([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState("");
  const [submitAction, setSubmitAction] = useState<
    "draft" | "pending" | "unchanged" | null
  >(null);
  const [error, setError] = useState("");
  const [partialSuccess, setPartialSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const previews = selectedImages.map((file) => ({
      fileKey: getCompanyProjectImageFileKey(file),
      url: URL.createObjectURL(file),
    }));

    setSelectedImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedImages]);

  function validateForm(targetMode: "draft" | "pending" | "unchanged") {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const technology = parseCommaTags(technologyInput, 5);
    const industry = parseCommaTags(industryInput, 5);

    if (cleanTitle.length < 3 || cleanTitle.length > 100) {
      return "Tytuł realizacji musi mieć od 3 do 100 znaków.";
    }

    if (technology.length < 1 || technology.length > 5) {
      return "Podaj od 1 do 5 pozycji w polu Technologia / usługa.";
    }

    if (industry.length > 5) {
      return "Branża / zastosowanie może zawierać maksymalnie 5 pozycji.";
    }

    if (cleanDescription.length < 20 || cleanDescription.length > 800) {
      return "Krótki opis musi mieć od 20 do 800 znaków.";
    }

    if (targetMode === "pending" && !ndaConfirmation) {
      return "Przed wysłaniem do moderacji potwierdź oświadczenie NDA.";
    }

    return "";
  }

  function addSelectedImageFiles(newFiles: File[]) {
    setError("");
    setPartialSuccess("");

    if (newFiles.length === 0) {
      return;
    }

    const currentKeys = new Set(selectedImages.map(getCompanyProjectImageFileKey));
    const uniqueNewFiles = newFiles.filter(
      (file) => !currentKeys.has(getCompanyProjectImageFileKey(file))
    );

    if (uniqueNewFiles.length === 0) {
      setError("Ten plik został już dodany do kolejki.");
      return;
    }

    const mergedFiles = [...selectedImages, ...uniqueNewFiles];
    const validationError = validateCompanyProjectImageFiles(
      mergedFiles,
      existingImages.length
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedImages(mergedFiles);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    addSelectedImageFiles(newFiles);
  }

  function handleImageDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsDraggingImages(true);
  }

  function handleImageDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingImages(false);
  }

  function handleImageDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingImages(false);

    if (isSubmitting) {
      return;
    }

    addSelectedImageFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function removeSelectedImage(fileKey: string) {
    setSelectedImages((current) =>
      current.filter((file) => getCompanyProjectImageFileKey(file) !== fileKey)
    );
    setError("");
  }

  async function uploadSelectedImages(params: {
    supabase: ReturnType<typeof createClient>;
    projectId: string;
    startOrder: number;
  }) {
    let failedUploads = 0;

    for (let index = 0; index < selectedImages.length; index += 1) {
      const file = selectedImages[index];
      const fileName = createCompanyProjectImageFileName(file);

      if (!fileName) {
        failedUploads += 1;
        continue;
      }

      const storagePath = `companies/${company.id}/projects/${params.projectId}/${fileName}`;

      const { error: uploadError } = await params.supabase.storage
        .from(COMPANY_PROJECT_IMAGES_BUCKET)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        failedUploads += 1;
        continue;
      }

      const { error: metadataError } = await params.supabase
        .from("company_project_images")
        .insert({
          project_id: params.projectId,
          company_id: company.id,
          storage_path: storagePath,
          display_order: params.startOrder + index,
        });

      if (metadataError) {
        await params.supabase.storage
          .from(COMPANY_PROJECT_IMAGES_BUCKET)
          .remove([storagePath]);
        failedUploads += 1;
      }
    }

    return failedUploads;
  }

  async function deleteExistingImage(image: ProjectImageData) {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć to zdjęcie realizacji?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setPartialSuccess("");
    setDeletingImageId(image.id);
    const supabase = createClient();

    const { error: storageError } = await supabase.storage
      .from(COMPANY_PROJECT_IMAGES_BUCKET)
      .remove([image.storage_path]);

    if (storageError) {
      setError("Nie udało się usunąć zdjęcia ze Storage.");
      setDeletingImageId("");
      return;
    }

    const { error: deleteError } = await supabase
      .from("company_project_images")
      .delete()
      .eq("id", image.id)
      .eq("project_id", project?.id ?? "");

    if (deleteError) {
      setError(deleteError.message);
      setDeletingImageId("");
      return;
    }

    setExistingImages((current) => current.filter((item) => item.id !== image.id));
    setDeletingImageId("");
    router.refresh();
  }

  async function handleProcessSubmit(targetMode: "draft" | "pending" | "unchanged") {
    setError("");
    setPartialSuccess("");

    const validationError = validateForm(targetMode);
    if (validationError) {
      setError(validationError);
      return;
    }

    const imageValidationError = validateCompanyProjectImageFiles(
      selectedImages,
      existingImages.length
    );

    if (imageValidationError) {
      setError(imageValidationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitAction(targetMode);

    const supabase = createClient();
    const nextTechnology = parseCommaTags(technologyInput, 5);
    const nextIndustry = parseCommaTags(industryInput, 5);
    const basePayload = {
      title: title.trim(),
      technology: nextTechnology,
      industry: nextIndustry,
      description: description.trim(),
      nda_confirmation: ndaConfirmation,
    };

    let nextProjectId = project?.id ?? "";
    let nextStatus = currentStatus;

    if (mode === "new") {
      const { data: insertedProject, error: saveError } = await supabase
        .from("company_projects")
        .insert({
          ...basePayload,
          company_id: company.id,
          slug: slugify(title),
          status: targetMode === "pending" ? "pending" : "draft",
        })
        .select("id, status")
        .single();

      if (saveError || !insertedProject?.id) {
        setError(saveError?.message ?? "Nie udało się zapisać realizacji.");
        setIsSubmitting(false);
        setSubmitAction(null);
        return;
      }

      nextProjectId = insertedProject.id;
      nextStatus = (insertedProject.status as ProjectStatus) ?? nextStatus;
    } else {
      const updatePayload = {
        ...basePayload,
        ...(targetMode === "pending" ? { status: "pending" } : {}),
        ...(targetMode === "draft" && currentStatus === "draft"
          ? { status: "draft" }
          : {}),
      };

      const { data: updatedProject, error: saveError } = await supabase
        .from("company_projects")
        .update(updatePayload)
        .eq("id", project?.id ?? "")
        .select("status")
        .single();

      if (saveError) {
        setError(saveError.message);
        setIsSubmitting(false);
        setSubmitAction(null);
        return;
      }

      nextStatus = (updatedProject?.status as ProjectStatus) ?? nextStatus;
    }

    if (selectedImages.length > 0) {
      const failedUploads = await uploadSelectedImages({
        supabase,
        projectId: nextProjectId,
        startOrder:
          existingImages.reduce(
            (maxOrder, image) => Math.max(maxOrder, image.display_order),
            -1
          ) + 1,
      });

      if (failedUploads > 0) {
        setPartialSuccess(
          "Realizacja została zapisana, ale nie wszystkie zdjęcia udało się dodać. Spróbuj ponownie w edycji."
        );
        setIsSubmitting(false);
        setSubmitAction(null);
        return;
      }
    }

    if (targetMode === "draft") {
      router.push("/panel/realizacje?draft_saved=1");
    } else if (targetMode === "pending" || nextStatus === "pending") {
      router.push("/panel/realizacje?pending_saved=1");
    } else {
      router.push("/panel/realizacje?saved=1");
    }
    router.refresh();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleProcessSubmit(canSubmitToModeration ? "pending" : "unchanged");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
          {mode === "new" ? "Nowa realizacja" : "Edycja realizacji"}
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {mode === "new" ? "Dodaj przykład realizacji" : "Edytuj przykład realizacji"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          To deklaracja wykonawcy. WolneMoce moderuje treść przed publikacją,
          ale nie potwierdza jej jako formalnego poświadczenia klienta.
        </p>
      </div>

      {mode === "edit" ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <p className="font-bold">Ponowna moderacja po zmianach</p>
          <p className="mt-2">
            Zmiana opublikowanej lub odrzuconej realizacji spowoduje ponowne
            przekazanie jej do moderacji.
          </p>
          <p className="mt-2">
            Aktualny status: <strong>{statusLabels[currentStatus]}</strong>.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {partialSuccess ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {partialSuccess}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-heading text-[#1a5f3c]"></i>
            Tytuł realizacji
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
            placeholder="Np. Frezowanie obudów aluminiowych dla branży automotive"
            maxLength={100}
          />
          <span className="mt-2 block text-xs text-slate-400">
            3-100 znaków
          </span>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-screwdriver-wrench text-[#1a5f3c]"></i>
            Technologia / usługa
          </span>
          <input
            value={technologyInput}
            onChange={(event) => setTechnologyInput(event.target.value)}
            className={inputClass}
            placeholder="Np. CNC, spawanie, montaż, wtrysk tworzyw"
          />
          <span className="mt-2 block text-xs text-slate-400">
            1-5 pozycji, oddzielone przecinkami
          </span>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-industry text-[#1a5f3c]"></i>
            Branża / zastosowanie
          </span>
          <input
            value={industryInput}
            onChange={(event) => setIndustryInput(event.target.value)}
            className={inputClass}
            placeholder="Np. automotive, AGD, medyczna, maszynowa"
          />
          <span className="mt-2 block text-xs text-slate-400">
            0-5 pozycji, oddzielone przecinkami
          </span>
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-align-left text-[#1a5f3c]"></i>
            Krótki opis
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={7}
            className={inputClass}
            placeholder="Napisz krótko: co było do wykonania, jakiej technologii użyto i jaki był efekt."
            maxLength={800}
          />
          <span className="mt-2 block text-xs text-slate-400">
            20-800 znaków
          </span>
        </label>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
          <div className="mb-5 space-y-4">
            <div className="min-w-0">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <i className="fas fa-images text-[#1a5f3c]"></i>
                Zdjęcia realizacji
              </p>
              <p className="text-sm leading-6 text-slate-500">
                Dodaj maksymalnie 3 publiczne zdjęcia. Dozwolone są JPG, PNG i
                WEBP, maksymalnie 5 MB na plik.
              </p>
              <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                Nie dodawaj zdjęć prototypów, detali objętych NDA, dokumentacji
                technicznej, rysunków, numerów części, logo klienta ani danych
                umożliwiających identyfikację zleceniodawcy bez jego zgody.
              </p>
            </div>
            <div
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
              onDrop={handleImageDrop}
              className={`rounded-2xl border-2 border-dashed bg-white p-5 text-center transition ${
                isDraggingImages
                  ? "border-[#1a5f3c] bg-[#f4fbf7]"
                  : "border-slate-200 hover:border-[#1a5f3c]/50"
              }`}
            >
              <label className="mx-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#1a5f3c] bg-white px-4 py-3 text-sm font-bold text-[#1a5f3c] transition hover:bg-[#1a5f3c] hover:text-white">
                <i className="fas fa-cloud-arrow-up"></i>
                Wybierz zdjęcia
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="sr-only"
                  disabled={
                    isSubmitting ||
                    existingImages.length + selectedImages.length >=
                      MAX_COMPANY_PROJECT_IMAGES
                  }
                />
              </label>
              <p className="mt-3 text-sm font-semibold text-slate-700">
                Możesz też przeciągnąć pliki w to miejsce.
              </p>
            </div>
          </div>

          {existingImages.length > 0 ? (
            <div className="mb-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Zapisane zdjęcia
              </p>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {existingImages.map((image) => (
                  <div
                    key={image.id}
                    className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="aspect-video bg-slate-100">
                      <img
                        src={getCompanyProjectImagePublicUrl(image.storage_path)}
                        alt={title || "Zdjęcie realizacji"}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3">
                      <span className="text-xs font-semibold text-slate-500">
                        Zdjęcie {image.display_order + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteExistingImage(image)}
                        disabled={deletingImageId === image.id || isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <i className="fas fa-trash"></i>
                        {deletingImageId === image.id ? "Usuwanie..." : "Usuń"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedImages.length > 0 ? (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Gotowe do dodania
              </p>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {selectedImages.map((file) => {
                  const fileKey = getCompanyProjectImageFileKey(file);
                  const preview = selectedImagePreviews.find(
                    (item) => item.fileKey === fileKey
                  );

                  return (
                    <div
                      key={fileKey}
                      className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <div className="aspect-video bg-slate-100">
                        {preview ? (
                          <img
                            src={preview.url}
                            alt={file.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400">
                            Podgląd zdjęcia
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatImageSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(fileKey)}
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <i className="fas fa-xmark"></i>
                          Usuń
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500">
              Nie wybrano nowych zdjęć.
            </p>
          )}
        </section>

        <label className="flex min-w-0 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
          <input
            type="checkbox"
            checked={ndaConfirmation}
            onChange={(event) => setNdaConfirmation(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1a5f3c] focus:ring-[#1a5f3c]"
          />
          <span className="text-sm leading-6 text-slate-600">
            Oświadczam, że mam prawo opublikować ten opis i zdjęcia oraz że
            publikacja nie narusza NDA, tajemnicy przedsiębiorstwa, praw
            autorskich ani praw osób trzecich.
          </span>
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {mode === "new" ? (
          <>
            <button
              type="button"
              onClick={() => handleProcessSubmit("pending")}
              disabled={isSubmitting}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitAction === "pending" ? "Zapisywanie..." : "Wyślij do moderacji"}
            </button>
            <button
              type="button"
              onClick={() => handleProcessSubmit("draft")}
              disabled={isSubmitting}
              className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitAction === "draft" ? "Zapisywanie..." : "Zapisz szkic"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleProcessSubmit("unchanged")}
              disabled={isSubmitting}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitAction === "unchanged" ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
            {canSubmitToModeration ? (
              <button
                type="button"
                onClick={() => handleProcessSubmit("pending")}
                disabled={isSubmitting}
                className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitAction === "pending"
                  ? "Zapisywanie..."
                  : "Wyślij ponownie do moderacji"}
              </button>
            ) : null}
          </>
        )}
        <Link href="/panel/realizacje" className="btn btn-outline">
          Anuluj
        </Link>
      </div>
    </form>
  );
}
