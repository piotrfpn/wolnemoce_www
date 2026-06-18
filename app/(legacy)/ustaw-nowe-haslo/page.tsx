import type { Metadata } from "next";
import UpdatePasswordView from "@/components/views/UpdatePasswordView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.auth.passwordRecovery.update.title,
  description: dictionary.auth.passwordRecovery.update.subtitle,
  robots: {
    index: false,
    follow: false,
  },
};

type UpdatePasswordPageProps = {
  searchParams?: {
    next?: string;
    return_to?: string;
  };
};

export default function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const redirectParamName =
    searchParams?.next !== undefined ? "next" : "return_to";

  return (
    <UpdatePasswordView
      locale="pl"
      nextPath={searchParams?.next ?? searchParams?.return_to}
      redirectParamName={redirectParamName}
    />
  );
}
