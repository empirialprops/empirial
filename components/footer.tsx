"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getSiteSettings } from "@/lib/firebase/services";
import { EmpirialLogo } from "@/components/ui/empirial-logo";
import {
  getStoredSocialLinks,
  fetchRemoteSocialLinks,
  SocialLinksConfig,
  DEFAULT_SOCIAL_LINKS,
} from "@/lib/utils/socials-store";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.098.245.195.372.288a.077.077 0 0 1-.006.128c-.598.35-1.22.648-1.873.892-.041.016-.062.066-.041.107.356.698.767 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.677.15-.2.301-.777.979-.953 1.18-.175.2-.351.225-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.526.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.677-1.63-.928-2.232-.244-.587-.492-.507-.677-.517-.175-.01-.376-.01-.577-.01s-.526.075-.802.376c-.276.301-1.053 1.028-1.053 2.508s1.078 2.909 1.229 3.11c.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.23 1.377.197 1.895.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.2-.577-.35zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.982-1.411A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
  </svg>
);

const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const Footer = () => {
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<any>(null);
  const [socials, setSocials] = useState<SocialLinksConfig>(() => getStoredSocialLinks());

  useEffect(() => {
    async function loadFooter() {
      try {
        const data = await getSiteSettings();
        if (data) {
          setSettings(data);
        }
        const liveSocials = await fetchRemoteSocialLinks();
        if (liveSocials) {
          setSocials(liveSocials);
        }
      } catch (err) {
        console.error("Failed to fetch settings for footer:", err);
      }
    }
    loadFooter();

    // Listen to real-time sync events from Admin Panel
    const handleSocialsChange = (e: any) => {
      if (e?.detail) {
        setSocials(e.detail);
      } else {
        setSocials(getStoredSocialLinks());
      }
    };

    window.addEventListener("empirial-socials-updated", handleSocialsChange as EventListener);
    window.addEventListener("storage", handleSocialsChange as EventListener);

    return () => {
      window.removeEventListener("empirial-socials-updated", handleSocialsChange as EventListener);
      window.removeEventListener("storage", handleSocialsChange as EventListener);
    };
  }, []);

  const brandName = settings?.brandName || settings?.footer?.brandName || "EMPIRIAL";
  const tagline = settings?.tagline || settings?.footer?.tagline || "Prop Trading Intelligence & Evaluation Platform.";
  const copyrightText = settings?.copyrightText || settings?.footer?.copyrightText || `© ${year} ${brandName}. All rights reserved.`;

  // Dynamically assemble active social links from synced store & settings
  const dynamicSocialLinks: { name: string; href: string; icon: React.ComponentType<any> }[] = [];

  const discordHref = socials.discordUrl || settings?.discordUrl || settings?.contactPage?.discordUrl;
  if (discordHref) {
    dynamicSocialLinks.push({ name: "Discord", href: discordHref, icon: DiscordIcon });
  }

  const twitterHref = socials.twitterUrl || settings?.twitterUrl || settings?.xUrl;
  if (twitterHref) {
    dynamicSocialLinks.push({ name: "X", href: twitterHref, icon: XIcon });
  }

  const telegramHref = socials.telegramUrl || settings?.telegramUrl;
  if (telegramHref) {
    dynamicSocialLinks.push({ name: "Telegram", href: telegramHref, icon: TelegramIcon });
  }

  const youtubeHref = socials.youtubeUrl || settings?.youtubeUrl;
  if (youtubeHref) {
    dynamicSocialLinks.push({ name: "YouTube", href: youtubeHref, icon: YouTubeIcon });
  }

  const instagramHref = socials.instagramUrl || settings?.instagramUrl;
  if (instagramHref) {
    dynamicSocialLinks.push({ name: "Instagram", href: instagramHref, icon: InstagramIcon });
  }

  const whatsappHref = socials.whatsappUrl || settings?.whatsappUrl;
  if (whatsappHref) {
    dynamicSocialLinks.push({ name: "WhatsApp", href: whatsappHref, icon: WhatsAppIcon });
  }

  const linkedinHref = socials.linkedinUrl || settings?.linkedinUrl;
  if (linkedinHref) {
    dynamicSocialLinks.push({ name: "LinkedIn", href: linkedinHref, icon: LinkedInIcon });
  }

  // Include custom social links added in Admin
  if (socials.customLinks && Array.isArray(socials.customLinks)) {
    socials.customLinks.forEach((c) => {
      if (c.enabled && c.url) {
        dynamicSocialLinks.push({
          name: c.name || "Community",
          href: c.url,
          icon: GlobeIcon,
        });
      }
    });
  }

  const footerLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Careers", href: "/careers" },
    { name: "Prop Firms", href: "/firms" },
    { name: "Challenges", href: "/challenges" },
    { name: "Reviews", href: "/reviews" },
  ];

  return (
    <footer className="w-full border-t border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
            <div className="space-y-3">
              <EmpirialLogo height={32} />
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {tagline}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Quick Links</h3>
              <div className="flex flex-col gap-2">
                {footerLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Official Socials</h3>
              <div className="flex flex-wrap gap-2">
                {dynamicSocialLinks.map((social) => (
                  <Button
                    key={social.name}
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Link
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      title={social.name}
                    >
                      <social.icon className="h-4 w-4" />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col items-center justify-between gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
            <span>{copyrightText}</span>
            <span className="font-medium">#BuildingEmpires</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
