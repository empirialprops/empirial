import { createFileRoute } from "@tanstack/react-router";
import CategoryDealsPage from "@/app/[category]/deals/page";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const Route = createFileRoute("/$category/deals")({
  head: ({ params }) => {
    const title = `${cap(params.category)} Prop Firm Discount Codes | EMPIRIAL`;
    const description = `Verified discount codes for ${params.category} prop trading firms.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: DealsRoute,
});

function DealsRoute() {
  const { category } = Route.useParams();
  return <CategoryDealsPage category={category} />;
}
