import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/messages/page";

export const Route = createFileRoute("/admin/messages")({
  component: Page,
});
