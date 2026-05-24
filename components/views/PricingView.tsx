import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Pricing from "@/components/Pricing";
import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function PricingView({
  locale = defaultLocale,
}: {
  locale?: Locale;
}) {
  const dictionary = getDictionary(locale);

  return (
    <>
      <Navbar />
      <main>
        <PageHero
          label={dictionary.pricing.pageLabel}
          title={dictionary.pricing.pageTitle}
          description={dictionary.pricing.pageDescription}
          icon="fas fa-tags"
        />
        <Pricing locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}

