import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/platforms/page";

export const Route = createFileRoute("/admin/platforms")({
  component: Page,
});
