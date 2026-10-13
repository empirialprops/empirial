import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/profile/page";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile & Registered Events | EMPIRIAL 2.0" },
      { name: "description", content: "View your registered prop trading tournaments, giveaways, bootcamps, and Discord passports." },
      { property: "og:title", content: "My Profile & Registered Events | EMPIRIAL 2.0" },
      { property: "og:description", content: "View your registered prop trading tournaments, giveaways, bootcamps, and Discord passports." },
    ],
  }),
  component: Page,
});
