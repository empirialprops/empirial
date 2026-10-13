import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/contact/page";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact EMPIRIAL Desk — Audits, Support & Partnership Inquiries" },
      { name: "description", content: "Get in touch with the EMPIRIAL analyst desk for prop firm audit requests, verified payout support, or community inquiries." },
      { property: "og:title", content: "Contact EMPIRIAL Desk — Audits, Support & Partnership Inquiries" },
      { property: "og:description", content: "Get in touch with the EMPIRIAL analyst desk for prop firm audit requests, verified payout support, or community inquiries." },
    ],
  }),
  component: Page,
});
