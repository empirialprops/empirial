import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/logs/page";

export const Route = createFileRoute("/admin/logs")({
  component: Page,
});
