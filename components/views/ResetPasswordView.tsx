import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ResetPasswordClient from "@/app/(legacy)/reset-hasla/ResetPasswordClient";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSafeNextPath } from "@/lib/safeNextPath";

type ResetPasswordViewProps = {
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

export default function ResetPasswordView({
  locale = defaultLocale,
  nextPath,
  redirectParamName = "next",
}: ResetPasswordViewProps) {
  const dictionary = getDictionary(locale);
  const safeNextPath = getSafeNextPath(nextPath);
  const loginHref = withRedirectParam(
    getLocalizedPath("/logowanie", locale),
    safeNextPath,
    redirectParamName
  );
  const updatePasswordPath = withRedirectParam(
    getLocalizedPath("/ustaw-nowe-haslo", locale),
    safeNextPath,
    redirectParamName
  );

  return (
    <>
      <Navbar locale={locale} />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[560px] items-center px-6 py-16">
          <ResetPasswordClient
            labels={dictionary.auth.passwordRecovery.reset}
            loginHref={loginHref}
            updatePasswordPath={updatePasswordPath}
          />
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
