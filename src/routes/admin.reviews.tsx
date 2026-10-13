import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/reviews/page";

export const Route = createFileRoute("/admin/reviews")({
  component: Page,
});
