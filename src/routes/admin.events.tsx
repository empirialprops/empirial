import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/events/page";

export const Route = createFileRoute("/admin/events")({
  component: Page,
});
