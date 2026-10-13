import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/file-system/page";

export const Route = createFileRoute("/admin/file-system")({
  component: Page,
});
