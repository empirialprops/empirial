import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/blog/page";

export const Route = createFileRoute("/admin/blog")({
  component: Page,
});
