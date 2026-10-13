import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/challenges/page";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Prop Firm Challenges Compared — Rules, Targets & Time Limits | EMPIRIAL" },
      { name: "description", content: "Compare evaluation challenge rules across top prop firms: profit targets, drawdown type, time limits and reset policies." },
      { property: "og:title", content: "Prop Firm Challenges Compared — Rules, Targets & Time Limits | EMPIRIAL" },
      { property: "og:description", content: "Compare evaluation challenge rules across top prop firms: profit targets, drawdown type, time limits and reset policies." },
    ],
  }),
  component: Page,
});
