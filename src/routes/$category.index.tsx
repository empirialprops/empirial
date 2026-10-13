import { createFileRoute } from "@tanstack/react-router";
import CategoryPage from "@/app/[category]/page";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const Route = createFileRoute("/$category/")({
  head: ({ params }) => {
    const title = `Best ${cap(params.category)} Prop Firms 2026 | EMPIRIAL`;
    const description = `Compare the top ${params.category} prop trading firms: rules, profit splits and discount codes.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CategoryRoute,
});

function CategoryRoute() {
  const { category } = Route.useParams();
  return <CategoryPage category={category} />;
}
