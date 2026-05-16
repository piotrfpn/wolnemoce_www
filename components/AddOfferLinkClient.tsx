"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [href, setHref] = useState("/dodaj-oferte");

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setHref(data.user ? "/panel/oferty/nowa" : "/dodaj-oferte");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHref(session?.user ? "/panel/oferty/nowa" : "/dodaj-oferte");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Link href={href} onClick={onNavigate} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
