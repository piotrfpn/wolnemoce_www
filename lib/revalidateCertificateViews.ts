import { revalidatePath } from "next/cache";
import { prefixedLocales } from "@/lib/i18n/config";

export function revalidateCertificateViews(companySlug?: string | null) {
  // Katalogi firm
  revalidatePath("/firmy");
  for (const locale of prefixedLocales) {
    if (locale) revalidatePath(`/${locale}/firmy`);
  }

  // Publiczny profil firmy
  const safeSlug = companySlug?.trim();
  if (safeSlug) {
    revalidatePath(`/firmy/${safeSlug}`);
    for (const locale of prefixedLocales) {
      if (locale) revalidatePath(`/${locale}/firmy/${safeSlug}`);
    }
  }

  // Widoki admina
  revalidatePath("/admin");
  revalidatePath("/admin/certyfikaty");
}
