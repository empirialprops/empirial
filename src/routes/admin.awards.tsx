import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/awards/page";

export const Route = createFileRoute("/admin/awards")({
  component: Page,
});
