export const maxRfqAttachmentCount = 3;
export const maxRfqAttachmentSize = 10 * 1024 * 1024;

export const allowedRfqAttachmentExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "jpg",
  "jpeg",
  "png",
]);

export const allowedRfqAttachmentMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
]);

export type RfqAttachmentFile = {
  name: string;
  size: number;
  type?: string;
};

export function getRfqAttachmentExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return extension === fileName.toLowerCase() ? "" : extension;
}

export function formatRfqAttachmentSize(size: number) {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateRfqAttachmentFiles(files: RfqAttachmentFile[]) {
  if (files.length > maxRfqAttachmentCount) {
    return "Możesz dodać maksymalnie 3 załączniki.";
  }

  for (const file of files) {
    const extension = getRfqAttachmentExtension(file.name);
    const hasAllowedExtension = allowedRfqAttachmentExtensions.has(extension);
    const hasAllowedMimeType = file.type
      ? allowedRfqAttachmentMimeTypes.has(file.type)
      : false;

    if (file.size > maxRfqAttachmentSize) {
      return "Pojedynczy załącznik może mieć maksymalnie 10 MB.";
    }

    if (!hasAllowedExtension && !hasAllowedMimeType) {
      return "Dozwolone formaty załączników to PDF, Word, Excel, JPG lub PNG.";
    }
  }

  return "";
}
