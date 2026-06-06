import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RegisterFormClient from "@/app/rejestracja/RegisterFormClient";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSafeNextPath } from "@/lib/safeNextPath";

type RegisterViewProps = {
  locale?: Locale;
  nextPath?: string;
};

function withNextParam(href: string, nextPath: string) {
  return nextPath ? `${href}?next=${encodeURIComponent(nextPath)}` : href;
}

export default function RegisterView({
  locale = defaultLocale,
  nextPath,
}: RegisterViewProps) {
  const dictionary = getDictionary(locale);
  const safeNextPath = getSafeNextPath(nextPath);
  const loginHref = withNextParam(
    getLocalizedPath("/logowanie", locale),
    safeNextPath
  );

  return (
    <>
      <Navbar locale={locale} />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[560px] items-center px-6 py-16">
          <RegisterFormClient
            labels={dictionary.auth.register}
            loginHref={loginHref}
            nextPath={safeNextPath}
            privacyHref={getLocalizedPath("/polityka-prywatnosci", locale)}
            termsHref={getLocalizedPath("/regulamin", locale)}
          />
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
