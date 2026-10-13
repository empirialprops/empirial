import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/page";

export const Route = createFileRoute("/admin/")({
  component: Page,
});
