import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/referrals/page";

export const Route = createFileRoute("/admin/referrals")({
  component: Page,
});
