"use client";

import { useEffect, useRef } from 'react';

/**
 * A wrapper component that fades its children into view when they enter
 * the viewport. This uses the IntersectionObserver API to add
 * transition classes once the element is visible. It expects Tailwind
 * utility classes for opacity and translation; see usage throughout
 * the page components.
 */
export default function FadeIn({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      {
        threshold: 0.1,
      },
    );
    observer.observe(node);
    return () => {
      observer.unobserve(node);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-8 transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  );
}