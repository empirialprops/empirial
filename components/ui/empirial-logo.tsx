"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSiteSettings } from "@/lib/firebase/services";

interface EmpirialLogoProps {
  height?: number | string; // Height of the logo PNG in pixels or CSS units
  showText?: boolean;
  textSize?: string;
  className?: string;
  href?: string;
}

export const EmpirialLogo: React.FC<EmpirialLogoProps> = ({
  height = 36,
  showText = true,
  textSize = "text-xl md:text-2xl font-bold tracking-tight",
  className = "",
  href = "/",
}) => {
  const hDim = typeof height === "number" ? `${height}px` : height;
  const [logoSettings, setLogoSettings] = useState({
    brandName: 'EMPIRIAL',
    logoDark: '/logos/empirial-trident-dark.png',
    logoLight: '/logos/empirial-trident-light.png'
  });

  useEffect(() => {
    async function loadLogo() {
      try {
        const settings = await getSiteSettings();
        if (settings) {
          setLogoSettings({
            brandName: settings.brandName || settings.footer?.brandName || 'EMPIRIAL',
            logoDark: settings.logoDarkUrl || '/logos/empirial-trident-dark.png',
            logoLight: settings.logoLightUrl || '/logos/empirial-trident-light.png'
          });
        }
      } catch (err) {
        console.error('Failed to load dynamic logo settings:', err);
      }
    }
    loadLogo();
  }, []);

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Transparent PNG Logo Element - 1st Image (White Trident) for Dark/Black Theme, 2nd Image (Black Trident) for Light/White Theme */}
      <div className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        {/* 1st Image PNG Logo (Black Theme: White Trident with Transparent Background) */}
        <img
          src={logoSettings.logoDark}
          alt={`${logoSettings.brandName} Logo`}
          className="hidden dark:block object-contain"
          style={{ height: hDim, width: "auto" }}
        />
        {/* 2nd Image PNG Logo (White Theme: Black Trident with Transparent Background) */}
        <img
          src={logoSettings.logoLight}
          alt={`${logoSettings.brandName} Logo`}
          className="block dark:hidden object-contain"
          style={{ height: hDim, width: "auto" }}
        />
      </div>

      {showText && (
        <span className={`text-foreground transition-colors group-hover:opacity-90 ${textSize}`}>
          {logoSettings.brandName}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`${logoSettings.brandName} Homepage`} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};

export default EmpirialLogo;
