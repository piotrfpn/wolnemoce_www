import { revalidatePath } from "next/cache";
import { prefixedLocales } from "@/lib/i18n/config";

export function revalidateCertificateViews(companySlug?: string | null) {
  // Katalogi firm
  revalidatePath("/firmy");
  for (const locale of prefixedLocales) {
    revalidatePath(`/${locale}/firmy`);
  }

  // Publiczny profil firmy
  if (companySlug) {
    revalidatePath(`/firmy/${companySlug}`);
    for (const locale of prefixedLocales) {
      revalidatePath(`/${locale}/firmy/${companySlug}`);
    }
  }

  // Widoki admina
  revalidatePath("/admin");
  revalidatePath("/admin/certyfikaty");
}
