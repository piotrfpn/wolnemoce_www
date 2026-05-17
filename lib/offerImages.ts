const fallbackImage = "/images/offers/cnc.jpg";
const offerImagesBucket = "offer-images";

const industryImages: Record<string, string> = {
  Automatyka: "/images/offers/automation.jpg",
  "Chemia i kosmetyki": "/images/offers/injection.jpg",
  "Drewno i meble": "/images/offers/cnc.jpg",
  "Druk i poligrafia": "/images/offers/automation.jpg",
  Elektronika: "/images/offers/automation.jpg",
  Lakiernictwo: "/images/offers/cnc.jpg",
  Logistyka: "/images/offers/automation.jpg",
  Magazynowanie: "/images/offers/automation.jpg",
  Metalurgia: "/images/offers/cnc.jpg",
  Tekstylia: "/images/offers/injection.jpg",
  "Tworzywa sztuczne": "/images/offers/injection.jpg",
  "Utrzymanie ruchu": "/images/offers/automation.jpg",
  Żywność: "/images/offers/injection.jpg",
};

export function getOfferImageByIndustry(industry?: string | null): string {
  const normalizedIndustry = industry?.trim();

  if (!normalizedIndustry) {
    return fallbackImage;
  }

  return industryImages[normalizedIndustry] ?? fallbackImage;
}

export function getPublicOfferImageUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${supabaseUrl}/storage/v1/object/public/${offerImagesBucket}/${encodedPath}`;
}
