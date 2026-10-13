import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/spreads/page";

export const Route = createFileRoute("/admin/spreads")({
  component: Page,
});
