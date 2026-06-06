import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import LoginFormClient from "@/app/logowanie/LoginFormClient";
import { defaultLocale, getLocalizedPath, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSafeNextPath } from "@/lib/safeNextPath";

type LoginViewProps = {
  locale?: Locale;
  nextPath?: string;
  oauthError?: boolean;
};

function withNextParam(href: string, nextPath: string) {
  return nextPath ? `${href}?next=${encodeURIComponent(nextPath)}` : href;
}

export default function LoginView({
  locale = defaultLocale,
  nextPath,
  oauthError = false,
}: LoginViewProps) {
  const dictionary = getDictionary(locale);
  const safeNextPath = getSafeNextPath(nextPath);
  const registerHref = withNextParam(
    getLocalizedPath("/rejestracja", locale),
    safeNextPath
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
