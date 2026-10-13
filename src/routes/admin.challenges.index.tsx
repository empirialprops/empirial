import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/challenges/page";

export const Route = createFileRoute("/admin/challenges/")({
  component: Page,
});
