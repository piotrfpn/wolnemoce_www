export const COMPANY_PROJECT_IMAGES_BUCKET = "company-project-images";
export const MAX_COMPANY_PROJECT_IMAGES = 3;
export const MAX_COMPANY_PROJECT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const mimeTypeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getCompanyProjectImageFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function getCompanyProjectImageExtension(file: File) {
  return mimeTypeExtensions[file.type] ?? "";
}

export function isAllowedCompanyProjectImage(file: File) {
  return allowedMimeTypes.includes(file.type);
}

export function validateCompanyProjectImageFiles(
  files: File[],
  existingCount = 0
) {
  if (existingCount + files.length > MAX_COMPANY_PROJECT_IMAGES) {
    return `Możesz dodać maksymalnie ${MAX_COMPANY_PROJECT_IMAGES} zdjęcia.`;
  }

  const oversizedFile = files.find(
    (file) => file.size > MAX_COMPANY_PROJECT_IMAGE_SIZE_BYTES
  );

  if (oversizedFile) {
    return "Plik jest za duży. Maksymalny rozmiar to 5 MB.";
  }

  const invalidFile = files.find((file) => !isAllowedCompanyProjectImage(file));

  if (invalidFile) {
    return "Dozwolone są tylko pliki JPG, PNG lub WEBP.";
  }

  return "";
}

export function createCompanyProjectImageFileName(file: File) {
  const extension = getCompanyProjectImageExtension(file);

  if (!extension) {
    return "";
  }

  return `${crypto.randomUUID()}.${extension}`;
}

export function getCompanyProjectImagePublicUrl(path: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return "";
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/${COMPANY_PROJECT_IMAGES_BUCKET}/${encodedPath}`;
}
