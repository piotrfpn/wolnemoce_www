import type { Metadata } from "next";
import ResetPasswordView from "@/components/views/ResetPasswordView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.auth.passwordRecovery.reset.title,
  description: dictionary.auth.passwordRecovery.reset.subtitle,
  robots: {
    index: false,
    follow: false,
  },
};

type ResetPasswordPageProps = {
  searchParams?: {
    next?: string;
    return_to?: string;
  };
};

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const redirectParamName =
    searchParams?.next !== undefined ? "next" : "return_to";

  return (
    <ResetPasswordView
      locale="pl"
      nextPath={searchParams?.next ?? searchParams?.return_to}
      redirectParamName={redirectParamName}
    />
  );
}
