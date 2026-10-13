import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/privacy-policy/page";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — EMPIRIAL" },
      { name: "description", content: "Learn how EMPIRIAL handles and protects user account information and audit telemetry." },
      { property: "og:title", content: "Privacy Policy — EMPIRIAL" },
      { property: "og:description", content: "Learn how EMPIRIAL handles and protects user account information and audit telemetry." },
    ],
  }),
  component: Page,
});
