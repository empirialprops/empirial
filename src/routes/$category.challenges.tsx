import { createFileRoute } from "@tanstack/react-router";
import CategoryChallengesPage from "@/app/[category]/challenges/page";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const Route = createFileRoute("/$category/challenges")({
  head: ({ params }) => {
    const title = `${cap(params.category)} Prop Firm Challenges Compared | EMPIRIAL`;
    const description = `Compare ${params.category} prop firm challenge prices, targets and drawdown rules.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ChallengesRoute,
});

function ChallengesRoute() {
  const { category } = Route.useParams();
  return <CategoryChallengesPage category={category} />;
}
