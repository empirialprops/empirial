import { createFileRoute } from "@tanstack/react-router";
import Page from "@/app/admin/market-ticker/page";

export const Route = createFileRoute("/admin/market-ticker")({
  component: Page,
});
