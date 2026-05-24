import type { Metadata } from "next";
import LoginView from "@/components/views/LoginView";
import { getDictionary } from "@/lib/i18n/getDictionary";

const dictionary = getDictionary("pl");

export const metadata: Metadata = {
  title: dictionary.auth.login.title,
  description: dictionary.auth.login.subtitle,
};

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginView locale="pl" nextPath={searchParams?.next} />;
}
