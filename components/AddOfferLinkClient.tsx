"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getLocaleFromPathname, getLocalizedPath } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/client";

type AddOfferLinkClientProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  onNavigate?: () => void;
};

export default function AddOfferLinkClient({
  children,
  className,
  ariaLabel,
  onNavigate,
}: AddOfferLinkClientProps) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const publicHref = getLocalizedPath("/dodaj-oferte", locale);
  const [href, setHref] = useState(publicHref);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setHref(data.user ? "/panel/oferty/nowa" : publicHref);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHref(session?.user ? "/panel/oferty/nowa" : publicHref);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [publicHref]);

  return (
    <Link href={href} onClick={onNavigate} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
