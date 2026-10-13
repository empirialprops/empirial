import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/roles/page";

export const Route = createFileRoute("/admin/roles")({
  component: Page,
});
