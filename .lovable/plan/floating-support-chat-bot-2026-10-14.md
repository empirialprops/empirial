# Floating support chat bot

A small round chat button stays in the bottom-right corner of every page except the admin area. Clicking it opens a support chat panel that matches your screenshots. The bot answers ready-made questions using the live firms, deals, challenges and reviews from your Firebase.

## What visitors see

- **Button:** a white circle with a chat icon and an "Support • Online 24/7" label beside it. It turns into an X while the chat is open.
- **Chat panel:** a dark card with the header "EMPIRIAL Support – Online • 24/7 • Instant replies" and a close button.
  - It opens with a welcome message and a row of quick-question chips.
  - Under the chips is a text box with a send button.
  - Bot replies can include link buttons, for example "Klein Funding profile" or "Compare all firms", that take visitors to that page.
- **Phones:** the panel fills most of the screen, and the button stays reachable.
- **Memory:** the conversation is kept for that browser tab, so it survives moving between pages.

## Ready-made questions (answered from your live data)

| Chip | Answer |
|---|---|
| Top rated firms | Top 3–5 firms by rating, with review count, profit split, payout schedule and discount, plus profile links |
| Best discounts & codes | Active deals with the biggest discount, discount code and firm |
| Cheapest challenges | Lowest-priced challenges, with account size, price and firm |
| Fastest payouts | Firms sorted by payout speed |
| Upcoming events | Next events from your Events list |
| How do reviews work? / Contact support | Fixed answers, with links to the Reviews and Contact pages |

## Typed questions

- **Firm name** ("tell me about Orion"): a summary of that firm with its rating, split, payout, current deal and cheapest challenge.
- **Keywords** like "discount", "code", "cheap", "payout", "best", "compare" or "event": the matching ready-made answer.
- **Anything else:** a friendly fallback that suggests the chips and links to the Contact page.

All answers are built in the browser from data that is already loaded. Nothing goes to an AI service, so replies are instant and free.

## Technical details

- New `src/components/support-bot/` with:
  - `SupportBot.tsx` for the button, panel and message list
  - `intents.ts` for keyword matching to answers
  - `answers.ts` for formatting data into replies
- Data comes from the existing `getFirms`, `getDeals`, `getChallenges` and events service functions in `src/lib/firebase/services.ts`. It is loaded once when the panel first opens and cached with TanStack Query.
- Mounted once in `src/routes/__root.tsx` and hidden on `/admin*` paths.
- Styling uses the existing design tokens in `src/styles.css`, with a small slide-up animation.
- Messages are stored in sessionStorage. The panel has `aria` labels, closes with Esc, and focuses the text box when it opens.

## Possible later upgrade (not included)

An AI fallback for questions the bot doesn't recognize, using the live data as context.
