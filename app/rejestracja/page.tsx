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
  };
};

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  return <RegisterView locale="pl" nextPath={searchParams?.next} />;
}
