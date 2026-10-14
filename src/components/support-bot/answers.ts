import type { Firm, Challenge, Deal, Event } from "@/lib/types";

export type BotLink = { label: string; to: string };
export type BotReply = { text: string; links?: BotLink[] };
export type BotData = { firms: Firm[]; deals: Deal[]; challenges: Challenge[]; events: Event[] };

const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const size = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}K` : money(n));
const challengePrice = (c: Challenge) => Number(c.discounted_price || c.price || 0);

function firmLine(f: Firm, i: number) {
  const parts = [`${i + 1}. ${f.name} • ★ ${Number(f.rating || 0).toFixed(1)} (${f.review_count || 0} reviews)`];
  if (f.profit_split_custom) parts.push(`Split ${f.profit_split_custom}`);
  if (f.payout_custom) parts.push(`Payout: ${f.payout_custom}`);
  if (f.discount_label_custom) parts.push(f.discount_label_custom);
  return parts.join(" • ");
}

export function welcome(): BotReply {
  return {
    text: "Hi! 👋 I'm EMPIRIAL Support. Ask me about prop firms, discount codes, challenge prices, payouts or events — or tap a question below.",
  };
}

export function topFirms(d: BotData): BotReply {
  const list = [...d.firms].sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.review_count || 0) - (a.review_count || 0)).slice(0, 5);
  if (!list.length) return noData("firms");
  return {
    text: `Here are our top rated firms right now:\n\n${list.map(firmLine).join("\n")}\n\nOpen a profile for full rules, discount codes and verified reviews.`,
    links: [...list.slice(0, 3).map((f) => ({ label: `${f.name} profile`, to: `/firms/${f.slug}` })), { label: "Compare all firms", to: "/compare" }],
  };
}

export function bestDeals(d: BotData): BotReply {
  const list = [...d.deals].filter((x) => x.code || x.discount_pct).sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0)).slice(0, 5);
  if (!list.length) return noData("deals");
  return {
    text: `Biggest discounts available:\n\n${list
      .map((x, i) => `${i + 1}. ${x.firm_name} — ${x.discount_label || `${x.discount_pct}% OFF`}${x.code ? ` • Code: ${x.code}` : ""}`)
      .join("\n")}`,
    links: [{ label: "See all deals", to: "/deals" }],
  };
}

export function cheapestChallenges(d: BotData): BotReply {
  const list = [...d.challenges].filter((c) => challengePrice(c) > 0).sort((a, b) => challengePrice(a) - challengePrice(b)).slice(0, 5);
  if (!list.length) return noData("challenges");
  return {
    text: `Cheapest challenges right now:\n\n${list
      .map((c, i) => `${i + 1}. ${c.firm_name} — ${size(c.account_size)} ${c.steps === 0 ? "Instant" : `${c.steps}-Step`} for ${money(challengePrice(c))}${c.coupon_code ? ` (code ${c.coupon_code})` : ""}`)
      .join("\n")}`,
    links: [{ label: "Browse challenges", to: "/challenges" }],
  };
}

export function payouts(d: BotData): BotReply {
  const list = d.firms.filter((f) => f.payout_custom || f.avg_payout_time).slice(0, 6);
  if (!list.length) return noData("payout info");
  return {
    text: `Payout schedules:\n\n${list
      .map((f, i) => `${i + 1}. ${f.name} — ${f.payout_custom || f.payout_cycle || "—"}${f.avg_payout_time ? ` • Avg: ${f.avg_payout_time}` : ""}`)
      .join("\n")}`,
    links: [{ label: "Compare firms", to: "/compare" }],
  };
}

export function events(d: BotData): BotReply {
  const now = Date.now();
  const list = [...d.events]
    .filter((e) => !e.end_date || new Date(e.end_date).getTime() >= now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5);
  if (!list.length) return { text: "There are no upcoming events right now — check back soon!", links: [{ label: "Events page", to: "/events" }] };
  return {
    text: `Upcoming events & giveaways:\n\n${list
      .map((e, i) => `${i + 1}. ${e.title}${e.start_date ? ` — ${new Date(e.start_date).toLocaleDateString()}` : ""}${e.entry_type === "free" ? " • Free entry" : ""}`)
      .join("\n")}`,
    links: [{ label: "See all events", to: "/events" }],
  };
}

export function reviewsInfo(): BotReply {
  return {
    text: "Reviews on EMPIRIAL come from real traders. Sign in, open any firm profile and leave a rating with your experience. Verified payout proof gets a badge.",
    links: [{ label: "Read reviews", to: "/reviews" }],
  };
}

export function contact(): BotReply {
  return {
    text: "Need a human? Send us a message and our team will reply as soon as possible.",
    links: [{ label: "Contact us", to: "/contact" }],
  };
}

export function firmSummary(f: Firm, d: BotData): BotReply {
  const deal = d.deals.filter((x) => x.firm_id === f.id || x.firm_slug === f.slug).sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0))[0];
  const cheapest = d.challenges
    .filter((c) => (c.firm_id === f.id || c.firm_slug === f.slug) && challengePrice(c) > 0)
    .sort((a, b) => challengePrice(a) - challengePrice(b))[0];
  const lines = [
    `${f.name} • ★ ${Number(f.rating || 0).toFixed(1)} (${f.review_count || 0} reviews)`,
    f.profit_split_custom && `Profit split: ${f.profit_split_custom}`,
    f.payout_custom && `Payout: ${f.payout_custom}`,
    f.max_allocation && `Max allocation: ${f.max_allocation}`,
    f.platforms && `Platforms: ${f.platforms}`,
    deal ? `Best deal: ${deal.discount_label || `${deal.discount_pct}% OFF`}${deal.code ? ` • Code ${deal.code}` : ""}` : f.coupon_code_custom && `Code: ${f.coupon_code_custom}`,
    cheapest && `Cheapest challenge: ${size(cheapest.account_size)} for ${money(challengePrice(cheapest))}`,
  ].filter(Boolean);
  return { text: lines.join("\n"), links: [{ label: `${f.name} profile`, to: `/firms/${f.slug}` }] };
}

export function fallback(): BotReply {
  return {
    text: "I'm not sure about that one. Try one of the quick questions below, type a firm name, or contact our team.",
    links: [{ label: "Contact us", to: "/contact" }],
  };
}

function noData(what: string): BotReply {
  return { text: `I couldn't find any ${what} right now. Please try again in a moment.` };
}
