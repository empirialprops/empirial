import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/deals/page";

export const Route = createFileRoute("/admin/deals")({
  component: Page,
});
