import type { Metadata } from "next";
import RegisterView from "@/components/views/RegisterView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.auth.register.title,
  description: dictionary.auth.register.subtitle,
};

type RegisterPageProps = {
  searchParams?: {
    next?: string;
    return_to?: string;
  };
};

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const redirectParamName =
    searchParams?.next !== undefined ? "next" : "return_to";

  return (
    <RegisterView
      locale="pl"
      nextPath={searchParams?.next ?? searchParams?.return_to}
      redirectParamName={redirectParamName}
    />
  );
}
