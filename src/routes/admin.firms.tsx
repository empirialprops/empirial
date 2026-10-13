import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/firms/page";

export const Route = createFileRoute("/admin/firms")({
  component: Page,
});
