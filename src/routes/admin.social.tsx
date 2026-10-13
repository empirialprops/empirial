import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/social/page";

export const Route = createFileRoute("/admin/social")({
  component: Page,
});
