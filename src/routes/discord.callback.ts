import { createFileRoute } from "@tanstack/react-router";

// Alias: forwards /discord/callback to the real Discord sign-in handler.
export const Route = createFileRoute("/discord/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return new Response(null, {
          status: 302,
          headers: { Location: `/api/auth/discord/callback${url.search}${url.search ? "&" : "?"}via=alias` },
        });
      },
    },
  },
});
