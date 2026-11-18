"use client";

import { useEffect } from "react";
import { getSiteSettings } from "@/lib/firebase/services";

export function BrandingSync() {
  useEffect(() => {
    async function syncBranding() {
      try {
        const settings = await getSiteSettings();
        if (settings && settings.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = settings.faviconUrl;
        }
      } catch (err) {
        console.error("Branding sync failed:", err);
      }
    }
    syncBranding();
  }, []);

  return null;
}
