"use client";

import { useState } from "react";
import {
  buildAndroidChromeIntentUrl,
  buildExternalBrowserUrl,
  type InAppBrowserInfo,
} from "@/lib/inAppBrowser";
import type { Dictionary } from "@/lib/i18n/types";
import type { UtmParams } from "@/lib/utm";

type InAppBrowserNoticeProps = {
  info: InAppBrowserInfo;
  labels: Dictionary["auth"]["inAppBrowser"];
  utm: UtmParams | null;
};

export default function InAppBrowserNotice({
  info,
  labels,
  utm,
}: InAppBrowserNoticeProps) {
  const [copied, setCopied] = useState(false);

  if (!info.isInApp) {
    return null;
  }

  const targetUrl =
    typeof window !== "undefined"
      ? buildExternalBrowserUrl(window.location.href, utm)
      : "";

  const androidIntentUrl =
    info.isAndroid && targetUrl ? buildAndroidChromeIntentUrl(targetUrl) : null;

  async function handleCopyLink() {
    if (!targetUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = targetUrl;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard errors inside restricted webviews
    }
  }

  const title = info.appName
    ? `${labels.title} (${info.appName})`
    : labels.title;

  return (
    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-left text-xs leading-5 text-slate-700">
      <div className="flex items-start gap-2.5">
        <i className="fas fa-arrow-up-right-from-square mt-0.5 shrink-0 text-amber-700"></i>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-slate-600">{labels.description}</p>
          {!androidIntentUrl ? (
            <p className="mt-1.5 text-[11px] font-medium text-amber-900/90">
              {labels.iosHint}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            {androidIntentUrl ? (
              <a
                href={androidIntentUrl}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a5f3c] px-3 py-1.5 text-xs font-bold text-white no-underline transition hover:bg-[#144a2f]"
              >
                <i className="fas fa-external-link-alt text-[11px]"></i>
                <span>{labels.openInChrome}</span>
              </a>
            ) : null}

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#1a5f3c] hover:text-[#1a5f3c]"
            >
              <i
                className={`fas ${copied ? "fa-check text-[#1a5f3c]" : "fa-copy"} text-[11px]`}
              ></i>
              <span>{copied ? labels.copied : labels.copyLink}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
