import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/events/page";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Prop Trading Tournaments, Bootcamps & Live Events | EMPIRIAL" },
      { name: "description", content: "Compete in trading championships for $100k+ in cash and free 100K challenge accounts, or join institutional masterclasses." },
      { property: "og:title", content: "Prop Trading Tournaments, Bootcamps & Live Events | EMPIRIAL" },
      { property: "og:description", content: "Compete in trading championships for $100k+ in cash and free 100K challenge accounts, or join institutional masterclasses." },
    ],
  }),
  component: Page,
});
