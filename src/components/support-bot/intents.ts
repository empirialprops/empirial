import * as A from "./answers";
import type { BotData, BotReply } from "./answers";

export const QUICK_QUESTIONS = [
  { id: "top", label: "Top rated firms" },
  { id: "deals", label: "Best discounts & codes" },
  { id: "cheap", label: "Cheapest challenges" },
  { id: "payouts", label: "Fastest payouts" },
  { id: "events", label: "Upcoming events" },
  { id: "reviews", label: "How do reviews work?" },
  { id: "contact", label: "Contact support" },
] as const;

export type IntentId = (typeof QUICK_QUESTIONS)[number]["id"];

export function answerIntent(id: IntentId, d: BotData): BotReply {
  switch (id) {
    case "top": return A.topFirms(d);
    case "deals": return A.bestDeals(d);
    case "cheap": return A.cheapestChallenges(d);
    case "payouts": return A.payouts(d);
    case "events": return A.events(d);
    case "reviews": return A.reviewsInfo();
    case "contact": return A.contact();
  }
}

const KEYWORDS: Array<[IntentId, RegExp]> = [
  ["deals", /discount|code|coupon|promo|deal|offer|off\b/],
  ["cheap", /cheap|price|cost|lowest|budget|challenge|afford/],
  ["payouts", /payout|withdraw|paid|payment|split/],
  ["events", /event|giveaway|tournament|webinar|competition/],
  ["reviews", /review|rating|feedback/],
  ["contact", /contact|human|agent|help|support|email|talk/],
  ["top", /best|top|rated|recommend|compare|firm/],
];

export function answerText(input: string, d: BotData): BotReply {
  const q = input.toLowerCase();
  const firm = d.firms
    .filter((f) => f.name && q.includes(f.name.toLowerCase().split(" ")[0]))
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (firm) return A.firmSummary(firm, d);
  if (/^(hi|hello|hey|yo)\b/.test(q)) return A.welcome();
  for (const [id, re] of KEYWORDS) if (re.test(q)) return answerIntent(id, d);
  return A.fallback();
}
