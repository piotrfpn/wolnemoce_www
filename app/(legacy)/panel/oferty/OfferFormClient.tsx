"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { industryServiceTypes } from "@/lib/mockData";
import {
  createSafeOfferImageFileName,
  getOfferImageFileKey,
  MAX_OFFER_IMAGES,
  OFFER_IMAGES_BUCKET,
  validateOfferImageFiles,
} from "@/lib/offerImageUploads";
import { createClient } from "@/lib/supabase/client";
import {
  saveOfferImageMetadataAction,
  deleteOfferImageMetadataAction,
} from "./actions";
import type {
  PanelCommonDictionary,
  PanelOfferFormDictionary,
} from "@/lib/i18n/types";

type CompanyData = {
  id: string;
  name: string | null;
  industry: string | null;
  industries: string[] | null;
  service_types: string[] | null;
};

type OfferStatus = "draft" | "pending" | "active" | "rejected" | "archived";

type OfferData = {
  id: string;
  title: string | null;
  branch?: string | null;
  service_type: string | null;
  description: string | null;
  power_available: string | null;
  min_order: string | null;
  lead_time: string | null;
  status: OfferStatus;
};

export type OfferImageData = {
  id: string;
  path: string;
  alt: string | null;
  sort_order: number | null;
};

type OfferFormClientProps = {
  company: CompanyData;
  offer?: OfferData;
  offerImages?: OfferImageData[];
  mode: "new" | "edit";
  dict: PanelOfferFormDictionary;
  dictCommon: PanelCommonDictionary;
};

const inputClass =
  "min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1a5f3c] focus:bg-white focus:ring-4 focus:ring-[#1a5f3c]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

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

  return `${normalized || "oferta"}-${Date.now().toString(36)}`;
}

function getCompanyIndustries(company: CompanyData) {
  if (company.industries && company.industries.length > 0) {
    return company.industries;
  }

  return company.industry ? [company.industry] : [];
}

function getServicesForBranch(branch: string, companyServices: string[]) {
  const dictionaryServices = industryServiceTypes[branch] ?? [];
  return dictionaryServices.filter((service) => companyServices.includes(service));
}

function getOfferImagePublicUrl(path: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return "";
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/${OFFER_IMAGES_BUCKET}/${encodedPath}`;
}

function formatImageSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function OfferFormClient({
  company,
  offer,
  offerImages = [],
  mode,
  dict,
  dictCommon,
}: OfferFormClientProps) {
  const router = useRouter();
  const companyIndustries = getCompanyIndustries(company);
  const companyServices = company.service_types ?? [];
  const currentStatus = offer?.status ?? "draft";
  const canChooseStatus = mode === "new" || currentStatus === "draft";
  const showActiveModerationWarning = mode === "edit" && currentStatus === "active";
  const initialBranch =
    offer?.branch && companyIndustries.includes(offer.branch)
      ? offer.branch
      : companyIndustries[0] ?? "";

  const [title, setTitle] = useState(offer?.title ?? "");
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [serviceType, setServiceType] = useState(offer?.service_type ?? "");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [powerAvailable, setPowerAvailable] = useState(
    offer?.power_available ?? ""
  );
  const [minOrder, setMinOrder] = useState(offer?.min_order ?? "");
  const [leadTime, setLeadTime] = useState(offer?.lead_time ?? "");
  const [saveMode, setSaveMode] = useState<"draft" | "pending">(
    currentStatus === "pending" ? "pending" : "draft"
  );
  const [submitAction, setSubmitAction] = useState<"draft" | "pending" | "unchanged" | null>(null);
  const [existingImages, setExistingImages] = useState<OfferImageData[]>(
    [...offerImages].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedImagePreviews, setSelectedImagePreviews] = useState<
    { fileKey: string; url: string }[]
  >([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState("");
  const [error, setError] = useState("");
  const [partialSuccess, setPartialSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branchServices = useMemo(
    () => getServicesForBranch(selectedBranch, companyServices),
    [selectedBranch, companyServices]
  );

  const hasProfileSetup =
    companyIndustries.length > 0 && companyServices.length > 0;
  const canSaveOffer =
    hasProfileSetup &&
    Boolean(selectedBranch) &&
    branchServices.length > 0 &&
    !isSubmitting;

  useEffect(() => {
    const previews = selectedImages.map((file) => ({
      fileKey: getOfferImageFileKey(file),
      url: URL.createObjectURL(file),
    }));

    setSelectedImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedImages]);

  function validateForm() {
    if (!title.trim()) {
      return dict.validation.titleRequired;
    }

    if (!selectedBranch) {
      return dict.validation.branchRequired;
    }

    if (!serviceType || !branchServices.includes(serviceType)) {
      return dict.validation.serviceTypeRequired;
    }

    if (!description.trim()) {
      return dict.validation.descriptionRequired;
    }

    if (!powerAvailable.trim()) {
      return dict.validation.powerRequired;
    }

    if (!leadTime.trim()) {
      return dict.validation.leadTimeRequired;
    }

    return "";
  }

  function addSelectedImageFiles(newFiles: File[]) {
    setError("");
    setPartialSuccess("");

    if (newFiles.length === 0) {
      return;
    }

    const currentKeys = new Set(selectedImages.map(getOfferImageFileKey));
    const uniqueNewFiles = newFiles.filter(
      (file) => !currentKeys.has(getOfferImageFileKey(file))
    );

    if (uniqueNewFiles.length === 0) {
      setError(dict.images.duplicateError);
      return;
    }

    const mergedFiles = [...selectedImages, ...uniqueNewFiles];
    const validationError = validateOfferImageFiles(
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

    if (!hasProfileSetup || isSubmitting) {
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

    if (!hasProfileSetup || isSubmitting) {
      return;
    }

    addSelectedImageFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function removeSelectedImage(fileKey: string) {
    setSelectedImages((current) =>
      current.filter((file) => getOfferImageFileKey(file) !== fileKey)
    );
    setError("");
  }

  async function uploadSelectedImages(params: {
    supabase: ReturnType<typeof createClient>;
    userId: string;
    offerId: string;
    startOrder: number;
  }) {
    let failedUploads = 0;

    for (let index = 0; index < selectedImages.length; index += 1) {
      const file = selectedImages[index];
      const safeFileName = createSafeOfferImageFileName(file.name);
      const path = `${params.userId}/${params.offerId}/${safeFileName}`;

      const { error: uploadError } = await params.supabase.storage
        .from(OFFER_IMAGES_BUCKET)
        .upload(path, file, {
          contentType: file.type || undefined,
          upsert: false,
        });

      if (uploadError) {
        failedUploads += 1;
        continue;
      }

      const actionResult = await saveOfferImageMetadataAction({
        offerId: params.offerId,
        path,
        alt: title.trim() || dict.images.altFallback,
      });

      if (!actionResult.success) {
        try {
          await params.supabase.storage.from(OFFER_IMAGES_BUCKET).remove([path]);
        } catch (rollbackErr) {
          console.error("Rollback of offer image file from storage failed:", rollbackErr);
        }
        failedUploads += 1;
      }
    }

    return failedUploads;
  }

  async function deleteExistingImage(image: OfferImageData) {
    const confirmed = window.confirm(dict.images.deleteConfirm);

    if (!confirmed) {
      return;
    }

    setError("");
    setPartialSuccess("");
    setDeletingImageId(image.id);

    const offerId = offer?.id ?? "";
    if (!offerId) {
      setDeletingImageId("");
      return;
    }

    const actionResult = await deleteOfferImageMetadataAction({
      offerId,
      imageId: image.id,
    });

    if (!actionResult.success) {
      setError(
        actionResult.errorKey === "unauthorized"
          ? "Brak uprawnień do usunięcia zdjęcia."
          : "Nie udało się usunąć metadanych zdjęcia."
      );
      setDeletingImageId("");
      return;
    }

    const supabase = createClient();
    const { error: storageError } = await supabase.storage
      .from(OFFER_IMAGES_BUCKET)
      .remove([actionResult.path]);

    if (storageError) {
      console.warn("Storage offer image file removal failed after metadata deletion", storageError);
    }

    setExistingImages((current) =>
      current.filter((item) => item.id !== image.id)
    );
    setDeletingImageId("");
    router.refresh();
  }

  async function handleProcessSubmit(targetMode: "draft" | "pending" | "unchanged") {
    setError("");
    setPartialSuccess("");

    if (!canSaveOffer) {
      setError(dict.validation.profileRequired);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const imageValidationError = validateOfferImageFiles(
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
    const basePayload = {
      title: title.trim(),
      branch: selectedBranch,
      service_type: serviceType,
      description: description.trim(),
      power_available: powerAvailable.trim(),
      min_order: minOrder.trim() || null,
      lead_time: leadTime.trim(),
    };

    const savedOfferId = offer?.id;
    let nextOfferId = savedOfferId ?? "";
    let nextOfferStatus = currentStatus;

    if (mode === "new") {
      const { data: insertedOffer, error: saveError } = await supabase
        .from("offers")
        .insert({
          ...basePayload,
          company_id: company.id,
          slug: slugify(title),
          status: targetMode === "pending" ? "pending" : "draft",
        })
        .select("id")
        .single();

      if (saveError || !insertedOffer?.id) {
        if (saveError?.message?.includes("FREE_PLAN_OFFER_LIMIT_REACHED")) {
          setError(dict.limits.freePlan);
        } else if (saveError?.message?.includes("PLAN_OFFER_LIMIT_REACHED")) {
          setError(dict.limits.plan);
        } else {
          setError(dict.validation.saveError);
        }
        setIsSubmitting(false);
        setSubmitAction(null);
        return;
      }

      nextOfferId = insertedOffer.id as string;
    } else {
      const { data: updatedOffer, error: saveError } = await supabase
        .from("offers")
        .update({
          ...basePayload,
          ...(currentStatus === "draft" && targetMode !== "unchanged" ? { status: targetMode } : {}),
        })
        .eq("id", offer?.id ?? "")
        .select("status")
        .single();

      if (saveError) {
        if (saveError?.message?.includes("FREE_PLAN_OFFER_LIMIT_REACHED")) {
          setError(dict.limits.freePlan);
        } else if (saveError?.message?.includes("PLAN_OFFER_LIMIT_REACHED")) {
          setError(dict.limits.plan);
        } else {
          setError(dict.validation.saveError);
        }
        setIsSubmitting(false);
        return;
      }
      
      nextOfferStatus = updatedOffer?.status ?? currentStatus;
    }

    if (selectedImages.length > 0) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setPartialSuccess(dict.partialSuccess.authImageUpload);
        setIsSubmitting(false);
        return;
      }

      const failedUploads = await uploadSelectedImages({
        supabase,
        userId: user.id,
        offerId: nextOfferId,
        startOrder: existingImages.length,
      });

      if (failedUploads > 0) {
        setPartialSuccess(dict.partialSuccess.failedImageUpload);
        setIsSubmitting(false);
        return;
      }
    }

    if (mode === "edit" && currentStatus === "active") {
      const { data: finalOffer } = await supabase
        .from("offers")
        .select("status")
        .eq("id", offer?.id ?? "")
        .single();

      if (finalOffer?.status === "pending") {
        setPartialSuccess(dict.partialSuccess.activeResubmitted);
        setIsSubmitting(false);
        setSubmitAction(null);
        router.refresh();
        return;
      }
    }

    if (targetMode === "draft") {
      router.push("/panel/oferty?draft_saved=1");
    } else if (targetMode === "pending") {
      router.push("/panel/oferty?pending_saved=1");
    } else {
      router.push("/panel/oferty");
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleProcessSubmit(canChooseStatus ? "pending" : "unchanged");
      }}
      className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1a5f3c]">
          {mode === "new" ? dict.eyebrowNew : dict.eyebrowEdit}
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {mode === "new" ? dict.titleNew : dict.titleEdit}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {dict.description}
        </p>
      </div>

      {!hasProfileSetup ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">
            {dict.profileMissingTitle}
          </p>
          <p className="mt-2 leading-6">
            {dict.profileMissingDescription}
          </p>
          <Link
            href="/panel/profil"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#1a5f3c] no-underline"
          >
            {dict.completeProfile}
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      ) : null}

      {hasProfileSetup && selectedBranch && branchServices.length === 0 ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">
            {dict.branchServicesMissing}
          </p>
          <Link
            href="/panel/profil"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#1a5f3c] no-underline"
          >
            {dict.completeProfile}
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      ) : null}

      {showActiveModerationWarning ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
          <p className="font-bold">{dict.activeWarningTitle}</p>
          <p className="mt-2">
            {dict.activeWarningDescription}
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
            {dict.fields.title.label}
          </span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
            placeholder={dict.fields.title.placeholder}
            disabled={!hasProfileSetup}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-industry text-[#1a5f3c]"></i>
            {dict.fields.branch.label}
          </span>
          <select
            value={selectedBranch}
            onChange={(event) => {
              setSelectedBranch(event.target.value);
              setServiceType("");
            }}
            className={inputClass}
            disabled={!hasProfileSetup}
          >
            <option value="">{dict.fields.branch.placeholder}</option>
            {companyIndustries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-screwdriver-wrench text-[#1a5f3c]"></i>
            {dict.fields.serviceType.label}
          </span>
          <select
            value={serviceType}
            onChange={(event) => setServiceType(event.target.value)}
            className={inputClass}
            disabled={!canSaveOffer}
          >
            <option value="">{dict.fields.serviceType.placeholder}</option>
            {branchServices.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block min-w-0 md:col-span-2">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-align-left text-[#1a5f3c]"></i>
            {dict.fields.description.label}
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={6}
            className={inputClass}
            placeholder={dict.fields.description.placeholder}
            disabled={!hasProfileSetup}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-chart-bar text-[#1a5f3c]"></i>
            {dict.fields.powerAvailable.label}
          </span>
          <input
            value={powerAvailable}
            onChange={(event) => setPowerAvailable(event.target.value)}
            className={inputClass}
            placeholder={dict.fields.powerAvailable.placeholder}
            disabled={!hasProfileSetup}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-boxes-stacked text-[#1a5f3c]"></i>
            {dict.fields.minOrder.label}
          </span>
          <input
            value={minOrder}
            onChange={(event) => setMinOrder(event.target.value)}
            className={inputClass}
            placeholder={dict.fields.minOrder.placeholder}
            disabled={!hasProfileSetup}
          />
        </label>

        <label className="block min-w-0">
          <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            <i className="fas fa-clock text-[#1a5f3c]"></i>
            {dict.fields.leadTime.label}
          </span>
          <input
            value={leadTime}
            onChange={(event) => setLeadTime(event.target.value)}
            className={inputClass}
            placeholder={dict.fields.leadTime.placeholder}
            disabled={!hasProfileSetup}
          />
        </label>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
          <div className="mb-5 space-y-4">
            <div className="min-w-0">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <i className="fas fa-images text-[#1a5f3c]"></i>
                {dict.images.sectionTitle}
              </p>
              <p className="text-sm leading-6 text-slate-500">
                {dict.images.description}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {dict.images.requirements.replace("{count}", String(MAX_OFFER_IMAGES))}
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
                {dict.images.chooseButton}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="sr-only"
                  disabled={
                    !hasProfileSetup ||
                    isSubmitting ||
                    existingImages.length + selectedImages.length >= MAX_OFFER_IMAGES
                  }
                />
              </label>
              <p className="mt-3 text-sm font-semibold text-slate-700">
                {dict.images.dragHint}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {dict.images.uploadDelay}
              </p>
              <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                {dict.images.contactWarning}
              </p>
            </div>
          </div>

          {existingImages.length > 0 ? (
            <div className="mb-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                {dict.images.savedTitle}
              </p>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {existingImages.map((image) => (
                  <div
                    key={image.id}
                    className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="aspect-video bg-slate-100">
                      <img
                        src={getOfferImagePublicUrl(image.path)}
                        alt={image.alt ?? title ?? dict.images.altFallback}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3">
                      <span className="text-xs font-semibold text-slate-500">
                        {image.sort_order === 0 ? dict.images.mainImage : dict.images.offerImage}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteExistingImage(image)}
                        disabled={deletingImageId === image.id || isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <i className="fas fa-trash"></i>
                        {deletingImageId === image.id ? dict.images.deleting : dict.images.delete}
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
                {dict.images.readyTitle}
              </p>
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                {selectedImages.map((file) => {
                  const fileKey = getOfferImageFileKey(file);
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
                            {dict.images.previewFallback}
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
                          <p className="mt-1 text-xs font-semibold text-[#1a5f3c]">
                            {dict.images.ready}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(fileKey)}
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <i className="fas fa-xmark"></i>
                          {dict.images.delete}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500">
              {dict.images.emptyNew}
            </p>
          )}
        </section>

        {canChooseStatus ? null : (
          <div className="min-w-0 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            {dict.saveMode.statusUnchangedPrefix}{" "}
            <strong>{dict.statusLabels[currentStatus]}</strong>.
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {canChooseStatus ? (
          <>
            <button
              type="button"
              onClick={() => handleProcessSubmit("pending")}
              disabled={!canSaveOffer}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitAction === "pending" ? dict.submit.saving : dict.saveMode.pendingTitle}
            </button>
            <button
              type="button"
              onClick={() => handleProcessSubmit("draft")}
              disabled={!canSaveOffer}
              className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitAction === "draft" ? dict.submit.saving : dict.saveMode.draftTitle}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => handleProcessSubmit("unchanged")}
            disabled={!canSaveOffer}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitAction === "unchanged" ? dict.submit.saving : dict.submit.save}
          </button>
        )}
        <Link href="/panel/oferty" className="btn btn-outline">
          {dictCommon.cancel}
        </Link>
      </div>

      {canChooseStatus ? (
        <p className="mt-4 text-xs text-slate-500">
          Oferta wysłana do moderacji nie będzie widoczna publicznie, dopóki nie zatwierdzi jej administrator.
          Szkic zostanie zapisany tylko w panelu i nie trafi do moderacji.
        </p>
      ) : null}
    </form>
  );
}
