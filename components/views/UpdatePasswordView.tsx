import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UpdatePasswordClient from "@/app/(legacy)/ustaw-nowe-haslo/UpdatePasswordClient";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSafeNextPath } from "@/lib/safeNextPath";

type UpdatePasswordViewProps = {
  locale?: Locale;
  nextPath?: string;
  redirectParamName?: "next" | "return_to";
};

function withRedirectParam(
  href: string,
  nextPath: string,
  paramName: "next" | "return_to"
) {
  return nextPath
    ? `${href}?${paramName}=${encodeURIComponent(nextPath)}`
    : href;
}

export default function UpdatePasswordView({
  locale = defaultLocale,
  nextPath,
  redirectParamName = "next",
}: UpdatePasswordViewProps) {
  const dictionary = getDictionary(locale);
  const safeNextPath = getSafeNextPath(nextPath);
  const loginHref = withRedirectParam(
    getLocalizedPath("/logowanie", locale),
    safeNextPath,
    redirectParamName
  );

  return (
    <>
      <Navbar locale={locale} />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[560px] items-center px-6 py-16">
          <UpdatePasswordClient
            labels={dictionary.auth.passwordRecovery.update}
            loginHref={loginHref}
          />
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
