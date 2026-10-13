import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/careers/page";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Join EMPIRIAL — Prop Analyst, Quantitative & Community Careers" },
      { name: "description", content: "Explore open roles at EMPIRIAL and help build the world" },
      { property: "og:title", content: "Join EMPIRIAL — Prop Analyst, Quantitative & Community Careers" },
      { property: "og:description", content: "Explore open roles at EMPIRIAL and help build the world" },
    ],
  }),
  component: Page,
});
