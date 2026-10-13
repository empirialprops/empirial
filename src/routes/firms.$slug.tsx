import { createFileRoute, notFound } from "@tanstack/react-router";
import FirmProfilePage, { loadFirmProfile } from "@/app/firms/[slug]/page";

export const Route = createFileRoute("/firms/$slug")({
  loader: async ({ params }) => {
    const data = await loadFirmProfile(params.slug);
    if (!data.firm) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const name = loaderData?.firm?.name ?? "Prop Firm";
    const title = `${name} Review 2026 — Rules, Payout Proof & Discount Code | EMPIRIAL`;
    const description = `${name} evaluation rules, profit split, drawdown limits, verified payout proof and the latest discount code.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: FirmRoute,
  errorComponent: ({ error }) => <div className="p-10 text-center">{String((error as Error)?.message ?? error)}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Firm not found.</div>,
});

function FirmRoute() {
  const data = Route.useLoaderData();
  return <FirmProfilePage {...data} />;
}
