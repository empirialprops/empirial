import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/terms-and-conditions/page";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions & Risk Disclaimer — EMPIRIAL" },
      { name: "description", content: "Terms of service and financial risk disclaimers for EMPIRIAL / ANURAJ FX Platform." },
      { property: "og:title", content: "Terms and Conditions & Risk Disclaimer — EMPIRIAL" },
      { property: "og:description", content: "Terms of service and financial risk disclaimers for EMPIRIAL / ANURAJ FX Platform." },
    ],
  }),
  component: Page,
});
