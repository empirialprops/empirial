import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/challenges/batch/page";

export const Route = createFileRoute("/admin/challenges/batch")({
  component: Page,
});
