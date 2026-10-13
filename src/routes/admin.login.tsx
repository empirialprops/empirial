import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/login/page";

export const Route = createFileRoute("/admin/login")({
  component: Page,
});
