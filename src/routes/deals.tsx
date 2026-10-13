import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/deals/page";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Latest Prop Firm Discount Codes & Offers — EMPIRIAL" },
      { name: "description", content: "Verified, up-to-date discount codes for top prop trading firms. Updated daily." },
      { property: "og:title", content: "Latest Prop Firm Discount Codes & Offers — EMPIRIAL" },
      { property: "og:description", content: "Verified, up-to-date discount codes for top prop trading firms. Updated daily." },
    ],
  }),
  component: Page,
});
