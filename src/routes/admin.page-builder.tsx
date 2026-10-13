import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/page-builder/page";

export const Route = createFileRoute("/admin/page-builder")({
  component: Page,
});
