import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/pricing/page";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Membership Plans & Pricing — EMPIRIAL" },
      { name: "description", content: "Choose your EMPIRIAL intelligence tier for real-time drawdown monitors, institutional spread telemetry, and exclusive high-tier discounts." },
      { property: "og:title", content: "Membership Plans & Pricing — EMPIRIAL" },
      { property: "og:description", content: "Choose your EMPIRIAL intelligence tier for real-time drawdown monitors, institutional spread telemetry, and exclusive high-tier discounts." },
    ],
  }),
  component: Page,
});
