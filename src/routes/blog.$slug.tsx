import { createFileRoute, notFound } from "@tanstack/react-router";
import BlogPostPage from "@/app/blog/[slug]/page";
import { MOCK_BLOG_POSTS } from "@/lib/data/blog-data";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = MOCK_BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { title: post.title, excerpt: post.excerpt };
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.title ?? "Article"} | EMPIRIAL`;
    const description = loaderData?.excerpt ?? "Prop trading education from EMPIRIAL.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: BlogRoute,
  errorComponent: ({ error }) => <div className="p-10 text-center">{String((error as Error)?.message ?? error)}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Article not found.</div>,
});

function BlogRoute() {
  const { slug } = Route.useParams();
  return <BlogPostPage slug={slug} />;
}
