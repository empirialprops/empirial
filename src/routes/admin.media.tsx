import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/media/page";

export const Route = createFileRoute("/admin/media")({
  component: Page,
});
