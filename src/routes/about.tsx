import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/about/page";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EMPIRIAL 2.0 — Independent Prop Firm Audits & Intelligence" },
      { name: "description", content: "Learn about EMPIRIAL" },
      { property: "og:title", content: "About EMPIRIAL 2.0 — Independent Prop Firm Audits & Intelligence" },
      { property: "og:description", content: "Learn about EMPIRIAL" },
    ],
  }),
  component: Page,
});
