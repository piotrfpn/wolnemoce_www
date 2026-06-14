import { notFound, redirect } from "next/navigation";
import { isSupportedLocale } from "@/lib/i18n/config";

type LocalePanelRedirectPageProps = {
  params: {
    locale: string;
    segments?: string[];
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

function getQueryString(
  searchParams?: LocalePanelRedirectPageProps["searchParams"]
) {
  if (!searchParams) {
    return "";
  }

  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  });

  const query = params.toString();

  return query ? `?${query}` : "";
}

export default function LocalePanelRedirectPage({
  params,
  searchParams,
}: LocalePanelRedirectPageProps) {
  if (!isSupportedLocale(params.locale) || params.locale === "pl") {
    notFound();
  }

  const nestedPath = params.segments?.length
    ? `/${params.segments.map(encodeURIComponent).join("/")}`
    : "";

  redirect(`/panel${nestedPath}${getQueryString(searchParams)}`);
}
