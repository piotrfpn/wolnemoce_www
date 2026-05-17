"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type BlogPostFormState = {
  error?: string;
};

const allowedStatuses = new Set(["draft", "published", "archived"]);
const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const BLOG_IMAGES_BUCKET = "blog-images";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type BlogPostPayload = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  status: string;
  author_name: string;
  featured_image_alt: string | null;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
};

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Nie udało się sprawdzić roli administratora: ${error.message}`);
  }

  if (profile?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return { supabase, userId: user.id };
}

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizePolishChars(value: string) {
  return value
    .replace(/[ąĄ]/g, "a")
    .replace(/[ćĆ]/g, "c")
    .replace(/[ęĘ]/g, "e")
    .replace(/[łŁ]/g, "l")
    .replace(/[ńŃ]/g, "n")
    .replace(/[óÓ]/g, "o")
    .replace(/[śŚ]/g, "s")
    .replace(/[źŹżŻ]/g, "z");
}

function slugify(value: string) {
  return normalizePolishChars(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseTags(value: string) {
  const seen = new Set<string>();

  return value
    .split(",")
    .map((tag) => tag.trim().replace(/^#+/, ""))
    .filter(Boolean)
    .map((tag) => tag.replace(/\s+/g, " "))
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getImageFile(formData: FormData) {
  const file = formData.get("featured_image");

  if (file instanceof File && file.size > 0) {
    return file;
  }

  return null;
}

function validateImageFile(file: File) {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Zdjęcie przewodnie jest za duże. Maksymalny rozmiar to 5 MB.";
  }

  const extension = getFileExtension(file.name);
  const mimeTypeAllowed = file.type ? allowedImageMimeTypes.has(file.type) : false;
  const extensionAllowed = allowedImageExtensions.has(extension);

  if (!mimeTypeAllowed && !extensionAllowed) {
    return "Dozwolone formaty zdjęcia przewodniego to JPG, PNG lub WebP.";
  }

  return null;
}

function safeFileName(fileName: string) {
  const extension = getFileExtension(fileName);
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const safeBaseName =
    slugify(baseName).slice(0, 80) || `zdjecie-${Date.now().toString(36)}`;

  return extension ? `${safeBaseName}.${extension}` : safeBaseName;
}

async function uploadBlogImage(
  supabase: ReturnType<typeof createClient>,
  postId: string,
  file: File
) {
  const validationError = validateImageFile(file);

  if (validationError) {
    return { error: validationError };
  }

  const path = `blog-posts/${postId}/${Date.now()}-${safeFileName(file.name)}`;
  const options = file.type
    ? { contentType: file.type, upsert: false }
    : { upsert: false };

  const { error } = await supabase.storage
    .from(BLOG_IMAGES_BUCKET)
    .upload(path, file, options);

  if (error) {
    return {
      error: `Nie udało się wgrać zdjęcia przewodniego: ${error.message}`,
    };
  }

  return { path };
}

function getPostPayload(formData: FormData): { error: string } | { payload: BlogPostPayload } {
  const title = getValue(formData, "title");
  const slug = slugify(getValue(formData, "slug") || title);
  const content = getValue(formData, "content");
  const status = getValue(formData, "status") || "draft";

  if (!title) {
    return { error: "Podaj tytuł wpisu." };
  }

  if (!slug) {
    return { error: "Podaj poprawny slug albo tytuł wpisu." };
  }

  if (!content) {
    return { error: "Podaj treść wpisu." };
  }

  if (!allowedStatuses.has(status)) {
    return { error: "Nieprawidłowy status wpisu." };
  }

  return {
    payload: {
      title,
      slug,
      excerpt: getValue(formData, "excerpt") || null,
      content,
      category: getValue(formData, "category") || null,
      status,
      author_name: getValue(formData, "author_name") || "WolneMoce.pl",
      featured_image_alt: getValue(formData, "featured_image_alt") || null,
      tags: parseTags(getValue(formData, "tags")),
      meta_title: getValue(formData, "meta_title") || null,
      meta_description: getValue(formData, "meta_description") || null,
    },
  };
}

function getDuplicateMessage(error: { code?: string; message?: string }) {
  if (error.code === "23505" || error.message?.toLowerCase().includes("duplicate")) {
    return "Wpis z takim slugiem już istnieje. Wybierz inny slug.";
  }

  return error.message ?? "Nie udało się zapisać wpisu.";
}

export async function createBlogPost(
  _state: BlogPostFormState,
  formData: FormData
): Promise<BlogPostFormState> {
  const parsed = getPostPayload(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const imageFile = getImageFile(formData);
  if (imageFile) {
    const imageError = validateImageFile(imageFile);
    if (imageError) {
      return { error: imageError };
    }
  }

  const { supabase, userId } = await requireAdmin();

  const { data: duplicatePost, error: duplicateError } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", parsed.payload.slug)
    .maybeSingle();

  if (duplicateError) {
    return { error: `Nie udało się sprawdzić sluga: ${duplicateError.message}` };
  }

  if (duplicatePost) {
    return { error: "Wpis z takim slugiem już istnieje. Wybierz inny slug." };
  }

  const postId = crypto.randomUUID();
  let featuredImagePath: string | null = null;

  if (imageFile) {
    const uploadResult = await uploadBlogImage(supabase, postId, imageFile);
    if ("error" in uploadResult) {
      return { error: uploadResult.error };
    }
    featuredImagePath = uploadResult.path;
  }

  const publishedAt =
    parsed.payload.status === "published" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      id: postId,
      ...parsed.payload,
      featured_image_path: featuredImagePath,
      published_at: publishedAt,
      created_by: userId,
      updated_by: userId,
    })
    .select("slug")
    .single();

  if (error) {
    return { error: getDuplicateMessage(error) };
  }

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/blog");
  if (data?.slug) {
    revalidatePath(`/blog/${data.slug}`);
  }

  redirect("/admin/blog");
}

export async function updateBlogPost(
  _state: BlogPostFormState,
  formData: FormData
): Promise<BlogPostFormState> {
  const id = getValue(formData, "id");
  const previousSlug = getValue(formData, "previous_slug");

  if (!id) {
    return { error: "Brak identyfikatora wpisu." };
  }

  const parsed = getPostPayload(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const imageFile = getImageFile(formData);
  if (imageFile) {
    const imageError = validateImageFile(imageFile);
    if (imageError) {
      return { error: imageError };
    }
  }

  const { supabase, userId } = await requireAdmin();
  const { data: currentPost, error: currentError } = await supabase
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .single();

  if (currentError) {
    return { error: `Nie udało się pobrać wpisu: ${currentError.message}` };
  }

  const { data: duplicatePost, error: duplicateError } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", parsed.payload.slug)
    .neq("id", id)
    .maybeSingle();

  if (duplicateError) {
    return { error: `Nie udało się sprawdzić sluga: ${duplicateError.message}` };
  }

  if (duplicatePost) {
    return { error: "Wpis z takim slugiem już istnieje. Wybierz inny slug." };
  }

  let featuredImagePath: string | null = null;

  if (imageFile) {
    const uploadResult = await uploadBlogImage(supabase, id, imageFile);
    if ("error" in uploadResult) {
      return { error: uploadResult.error };
    }
    featuredImagePath = uploadResult.path;
  }

  const publishedAt =
    parsed.payload.status === "published" && !currentPost?.published_at
      ? new Date().toISOString()
      : currentPost?.published_at ?? null;

  const updatePayload: Record<string, unknown> = {
    ...parsed.payload,
    published_at: publishedAt,
    updated_by: userId,
  };

  if (featuredImagePath) {
    updatePayload.featured_image_path = featuredImagePath;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .update(updatePayload)
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    return { error: getDuplicateMessage(error) };
  }

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/blog");
  if (previousSlug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
  if (data?.slug) {
    revalidatePath(`/blog/${data.slug}`);
  }

  redirect("/admin/blog");
}

export async function archiveBlogPost(postId: string, slug: string | null) {
  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      status: "archived",
      updated_by: userId,
    })
    .eq("id", postId);

  if (error) {
    throw new Error(`Nie udało się zarchiwizować wpisu: ${error.message}`);
  }

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function deleteBlogPost(postId: string, slug: string | null) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

  if (error) {
    throw new Error(`Nie udało się usunąć wpisu: ${error.message}`);
  }

  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}
