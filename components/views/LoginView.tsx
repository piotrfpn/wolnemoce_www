import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LoginFormClient from "@/app/(legacy)/logowanie/LoginFormClient";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSafeNextPath } from "@/lib/safeNextPath";

type LoginViewProps = {
  locale?: Locale;
  nextPath?: string;
  oauthError?: boolean;
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

export default function LoginView({
  locale = defaultLocale,
  nextPath,
  oauthError = false,
  redirectParamName = "next",
}: LoginViewProps) {
  const dictionary = getDictionary(locale);
  const safeNextPath = getSafeNextPath(nextPath);
  const registerHref = withRedirectParam(
    getLocalizedPath("/rejestracja", locale),
    safeNextPath,
    redirectParamName
  );

  return (
    <>
      <Navbar locale={locale} />
      <main className="bg-slate-50 pt-[72px]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[560px] items-center px-6 py-16">
          <LoginFormClient
            labels={dictionary.auth.login}
            nextPath={safeNextPath}
            oauthError={oauthError}
            registerHref={registerHref}
          />
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
