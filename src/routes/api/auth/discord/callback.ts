import { createFileRoute } from "@tanstack/react-router";

// Discord OAuth callback: exchanges the code, then mints a Firebase custom token
// (signed with the service account key via WebCrypto — firebase-admin does not run on Workers).

function b64url(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importKey(pem: string) {
  const body = pem
    .replace(/\\n/g, "\n")
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

async function createCustomToken(uid: string, claims: Record<string, unknown>) {
  const email = process.env.FIREBASE_CLIENT_EMAIL!;
  const key = await importKey(process.env.FIREBASE_PRIVATE_KEY!);
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: email,
      sub: email,
      aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
      iat: now,
      exp: now + 3600,
      uid,
      claims,
    }),
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${payload}`));
  return `${header}.${payload}.${b64url(sig)}`;
}

function fail(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/auth/discord/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        if (!code || code.length > 200) return fail("Authorization code is missing");

        const clientId = process.env.DISCORD_CLIENT_ID;
        const clientSecret = process.env.DISCORD_CLIENT_SECRET;
        if (!clientId || !clientSecret || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
          return fail("Discord login is not configured", 500);
        }

        const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
        const protocol = host.startsWith("localhost") ? "http" : "https";
        const origin = `${protocol}://${host}`;
        const redirectUri = url.searchParams.get("via") === "alias" ? `${origin}/discord/callback` : `${origin}/api/auth/discord/callback`;

        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
          }),
        });
        if (!tokenRes.ok) {
          console.error("Discord token exchange failed", await tokenRes.text());
          return fail("Discord token exchange failed");
        }
        const { access_token } = (await tokenRes.json()) as { access_token: string };

        const userRes = await fetch("https://discord.com/api/users/@me", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (!userRes.ok) return fail("Failed to fetch Discord profile");
        const u = (await userRes.json()) as {
          id: string;
          username: string;
          global_name?: string;
          email?: string;
          avatar?: string;
        };

        const uid = `discord:${u.id}`;
        try {
          const token = await createCustomToken(uid, {
            provider: "discord",
            discord_name: u.global_name || u.username,
            ...(u.email ? { discord_email: u.email } : {}),
            ...(u.avatar ? { discord_avatar: `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png` } : {}),
          });
          const dest = new URL("/", origin);
          dest.searchParams.set("discord_token", token);
          return new Response(null, { status: 302, headers: { Location: dest.toString() } });
        } catch (e) {
          console.error("Custom token creation failed", e);
          return fail("Could not complete sign-in", 500);
        }
      },
    },
  },
});
