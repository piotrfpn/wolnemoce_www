export const OFFER_IMAGES_BUCKET = "offer-images";
export const MAX_OFFER_IMAGES = 5;
export const MAX_OFFER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

const polishChars: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
};

export function getOfferImageFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function getOfferImageExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isAllowedOfferImage(file: File) {
  const extension = getOfferImageExtension(file.name);
  const hasAllowedType = allowedMimeTypes.includes(file.type);
  const hasAllowedExtension = allowedExtensions.includes(extension);

  return hasAllowedType || hasAllowedExtension;
}

export function validateOfferImageFiles(files: File[], existingCount = 0) {
  if (existingCount + files.length > MAX_OFFER_IMAGES) {
    return `Możesz dodać maksymalnie ${MAX_OFFER_IMAGES} zdjęć oferty.`;
  }

  const oversizedFile = files.find(
    (file) => file.size > MAX_OFFER_IMAGE_SIZE_BYTES
  );

  if (oversizedFile) {
    return "Zdjęcie jest za duże. Maksymalny rozmiar to 5 MB.";
  }

  const invalidFile = files.find((file) => !isAllowedOfferImage(file));

  if (invalidFile) {
    return "Dozwolone formaty zdjęć to JPG, PNG lub WEBP.";
  }

  return "";
}

export function createSafeOfferImageFileName(fileName: string) {
  const extension = getOfferImageExtension(fileName);
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const safeBaseName =
    baseName
      .toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (char) => polishChars[char] ?? char)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-") || "zdjecie-oferty";

  return `${Date.now()}-${safeBaseName}.${extension || "jpg"}`;
}
