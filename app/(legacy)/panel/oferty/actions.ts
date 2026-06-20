"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SaveOfferImageMetadataInput = {
  offerId: string;
  path: string;
  alt?: string | null;
};

export type SaveOfferImageMetadataResult =
  | { success: true; image: { id: string; path: string; alt: string | null; sort_order: number } }
  | { success: false; errorKey: "unauthorized" | "offerNotFound" | "limitReached" | "invalidPayload" | "saveError" };

export type DeleteOfferImageMetadataInput = {
  offerId: string;
  imageId: string;
};

export type DeleteOfferImageMetadataResult =
  | { success: true; path: string }
  | { success: false; errorKey: "unauthorized" | "offerNotFound" | "imageNotFound" | "deleteError" };

async function persistOfferImageMetadata(
  input: SaveOfferImageMetadataInput
): Promise<SaveOfferImageMetadataResult> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, errorKey: "unauthorized" };
  }

  const { offerId, path, alt } = input;

  // Validate UUID for offerId
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!offerId || !uuidRegex.test(offerId)) {
    return { success: false, errorKey: "invalidPayload" };
  }

  // Validate Path
  const trimmedPath = path.trim();
  if (!trimmedPath || trimmedPath.includes("..")) {
    return { success: false, errorKey: "invalidPayload" };
  }

  const expectedPrefix = `${user.id}/${offerId}/`;
  if (!trimmedPath.startsWith(expectedPrefix)) {
    return { success: false, errorKey: "invalidPayload" };
  }

  // Validate Alt
  if (alt && /<[^>]*>/g.test(alt)) {
    return { success: false, errorKey: "invalidPayload" };
  }
  const cleanAlt = alt ? alt.trim().slice(0, 160) : null;

  // Verify ownership of the offer
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("company_id")
    .eq("id", offerId)
    .maybeSingle();

  if (offerError || !offer) {
    return { success: false, errorKey: "offerNotFound" };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("user_id")
    .eq("id", offer.company_id)
    .maybeSingle();

  if (companyError || !company || company.user_id !== user.id) {
    return { success: false, errorKey: "unauthorized" };
  }

  // Enforce server-side limit of 10 images
  const { count, error: countError } = await supabase
    .from("offer_images")
    .select("id", { count: "exact", head: true })
    .eq("offer_id", offerId);

  if (countError) {
    return { success: false, errorKey: "saveError" };
  }

  if (count !== null && count >= 10) {
    return { success: false, errorKey: "limitReached" };
  }

  // Calculate sort_order
  const { data: maxImage, error: maxError } = await supabase
    .from("offer_images")
    .select("sort_order")
    .eq("offer_id", offerId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    return { success: false, errorKey: "saveError" };
  }

  const nextSortOrder = maxImage ? (maxImage.sort_order ?? 0) + 1 : 0;

  // Insert DB record
  const { data: inserted, error: insertError } = await supabase
    .from("offer_images")
    .insert({
      offer_id: offerId,
      user_id: user.id,
      path: trimmedPath,
      alt: cleanAlt,
      sort_order: nextSortOrder,
    })
    .select("id, path, alt, sort_order")
    .single();

  if (insertError || !inserted) {
    return { success: false, errorKey: "saveError" };
  }

  return { success: true, image: { id: inserted.id, path: inserted.path, alt: inserted.alt, sort_order: inserted.sort_order } };
}

export async function saveOfferImageMetadataAction(
  input: SaveOfferImageMetadataInput
): Promise<SaveOfferImageMetadataResult> {
  let outcome: SaveOfferImageMetadataResult;
  try {
    outcome = await persistOfferImageMetadata(input);
  } catch (error) {
    console.warn("Save offer image metadata Server Action failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { success: false, errorKey: "saveError" };
  }

  revalidatePath("/panel/oferty");
  if (input.offerId) {
    revalidatePath(`/panel/oferty/${input.offerId}/edytuj`);
  }
  revalidatePath("/oferty");

  return outcome;
}

async function persistDeleteOfferImageMetadata(
  input: DeleteOfferImageMetadataInput
): Promise<DeleteOfferImageMetadataResult> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, errorKey: "unauthorized" };
  }

  const { offerId, imageId } = input;

  // Verify ownership of the offer
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("company_id")
    .eq("id", offerId)
    .maybeSingle();

  if (offerError || !offer) {
    return { success: false, errorKey: "offerNotFound" };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("user_id")
    .eq("id", offer.company_id)
    .maybeSingle();

  if (companyError || !company || company.user_id !== user.id) {
    return { success: false, errorKey: "unauthorized" };
  }

  // Find the image and verify it belongs to this offer and user
  const { data: image, error: imageError } = await supabase
    .from("offer_images")
    .select("path, user_id")
    .eq("id", imageId)
    .eq("offer_id", offerId)
    .maybeSingle();

  if (imageError || !image) {
    return { success: false, errorKey: "imageNotFound" };
  }

  if (image.user_id !== user.id) {
    return { success: false, errorKey: "unauthorized" };
  }

  // Delete DB record
  const { error: deleteError } = await supabase
    .from("offer_images")
    .delete()
    .eq("id", imageId)
    .eq("offer_id", offerId);

  if (deleteError) {
    return { success: false, errorKey: "deleteError" };
  }

  return { success: true, path: image.path };
}

export async function deleteOfferImageMetadataAction(
  input: DeleteOfferImageMetadataInput
): Promise<DeleteOfferImageMetadataResult> {
  let outcome: DeleteOfferImageMetadataResult;
  try {
    outcome = await persistDeleteOfferImageMetadata(input);
  } catch (error) {
    console.warn("Delete offer image metadata Server Action failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { success: false, errorKey: "deleteError" };
  }

  revalidatePath("/panel/oferty");
  if (input.offerId) {
    revalidatePath(`/panel/oferty/${input.offerId}/edytuj`);
  }
  revalidatePath("/oferty");

  return outcome;
}

export type DeleteOfferWithImagesInput = {
  offerId: string;
};

export type DeleteOfferWithImagesResult =
  | { success: true }
  | {
      success: false;
      errorKey:
        | "unauthorized"
        | "offerNotFound"
        | "offerDeleteBlockedHasInquiries"
        | "storageDeleteError"
        | "offerDeleteError"
        | "offerDeleteErrorAfterStorageCleanup";
    };

async function persistDeleteOfferWithImages(
  input: DeleteOfferWithImagesInput
): Promise<DeleteOfferWithImagesResult> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, errorKey: "unauthorized" };
  }

  const { offerId } = input;

  // Validate UUID for offerId
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!offerId || !uuidRegex.test(offerId)) {
    return { success: false, errorKey: "offerNotFound" };
  }

  // 1. Ownership check
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("company_id")
    .eq("id", offerId)
    .maybeSingle();

  if (offerError || !offer) {
    return { success: false, errorKey: "offerNotFound" };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("user_id")
    .eq("id", offer.company_id)
    .maybeSingle();

  if (companyError || !company || company.user_id !== user.id) {
    return { success: false, errorKey: "unauthorized" };
  }

  // 2. Business pre-flight check: inquiries
  // Protect buyer RFQ inquiries history from being cascaded.
  const { count: inquiriesCount, error: inquiriesCountError } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("offer_id", offerId);

  if (inquiriesCountError) {
    return { success: false, errorKey: "offerDeleteError" };
  }

  if (inquiriesCount !== null && inquiriesCount > 0) {
    return { success: false, errorKey: "offerDeleteBlockedHasInquiries" };
  }

  // 3. Fetch image paths from DB
  const { data: images, error: imagesError } = await supabase
    .from("offer_images")
    .select("path")
    .eq("offer_id", offerId);

  if (imagesError) {
    return { success: false, errorKey: "offerDeleteError" };
  }

  const paths = (images ?? [])
    .map((img) => img.path)
    .filter((path): path is string => Boolean(path));

  // 4. Storage cleanup
  if (paths.length > 0) {
    const { data: storageData, error: storageError } = await supabase.storage
      .from("offer-images")
      .remove(paths);

    if (storageError) {
      return { success: false, errorKey: "storageDeleteError" };
    }

    if (!storageData || !Array.isArray(storageData)) {
      return { success: false, errorKey: "storageDeleteError" };
    }

    // Granular storage error check
    const hasGranularError = storageData.some((item) => {
      if (!item || typeof item !== "object") return true;
      const obj = item as unknown as { error?: string; errorKey?: string; errorMessage?: string; status?: string };
      return (
        Boolean(obj.error) ||
        Boolean(obj.errorKey) ||
        Boolean(obj.errorMessage) ||
        (typeof obj.status === "string" && obj.status.toLowerCase().includes("fail"))
      );
    });

    if (hasGranularError) {
      return { success: false, errorKey: "storageDeleteError" };
    }

    const deletedNames = Array.from(new Set(
      storageData.map((item) => (item as unknown as { name?: string }).name)
    ));

    for (const name of deletedNames) {
      if (typeof name !== "string") {
        return { success: false, errorKey: "storageDeleteError" };
      }
      const isMatched = paths.some((p) => p === name || p.endsWith("/" + name));
      if (!isMatched) {
        return { success: false, errorKey: "storageDeleteError" };
      }
    }
  }

  // 5. DB delete offer
  const { error: deleteError } = await supabase
    .from("offers")
    .delete()
    .eq("id", offerId);

  if (deleteError) {
    return { success: false, errorKey: "offerDeleteErrorAfterStorageCleanup" };
  }

  return { success: true };
}

export async function deleteOfferWithImagesAction(
  input: DeleteOfferWithImagesInput
): Promise<DeleteOfferWithImagesResult> {
  let outcome: DeleteOfferWithImagesResult;
  try {
    outcome = await persistDeleteOfferWithImages(input);
  } catch (error) {
    console.error("deleteOfferWithImagesAction Server Action failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { success: false, errorKey: "offerDeleteError" };
  }

  revalidatePath("/panel/oferty");
  revalidatePath("/oferty");

  return outcome;
}
