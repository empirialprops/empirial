import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Headphones, Send } from "lucide-react";
import { getFirms, getDeals, getChallenges, getEvents } from "@/lib/firebase/services";
import { welcome, type BotData, type BotReply } from "./answers";
import { QUICK_QUESTIONS, answerIntent, answerText } from "./intents";

type Msg = { role: "user" | "bot"; text: string; links?: BotReply["links"] };
const KEY = "empirial-support-chat";

async function loadData(): Promise<BotData> {
  const safe = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[]);
  const [firms, deals, challenges, events] = await Promise.all([safe(getFirms()), safe(getDeals()), safe(getChallenges()), safe(getEvents())]);
  return { firms, deals, challenges, events };
}

export function SupportBot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({ queryKey: ["support-bot-data"], queryFn: loadData, enabled: open, staleTime: 5 * 60_000 });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      setMsgs(saved ? JSON.parse(saved) : [{ role: "bot", ...welcome() }]);
    } catch {
      setMsgs([{ role: "bot", ...welcome() }]);
    }
  }, []);

  useEffect(() => {
    if (msgs.length) sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-50)));
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname.startsWith("/admin")) return null;

  const reply = (userText: string, build: (d: BotData) => BotReply) => {
    setMsgs((m) => [...m, { role: "user", text: userText }]);
    setTyping(true);
    const run = (d: BotData) => {
      setTimeout(() => {
        setMsgs((m) => [...m, { role: "bot", ...build(d) }]);
        setTyping(false);
        inputRef.current?.focus();
      }, 400);
    };
    if (data) run(data);
    else loadData().then(run);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    reply(text, (d) => answerText(text, d));
  };

  return (
    <div className="support-bot fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div role="dialog" aria-label="EMPIRIAL Support chat" className="support-bot-panel flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background">
              <Headphones className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold leading-tight">EMPIRIAL Support</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-success" /> Online • 24/7 • Instant replies
              </p>
            </div>
            <button aria-label="Close chat" onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <div className={m.role === "user" ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground" : "max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm"}>
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  {m.links?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.links.map((l) => (
                        <Link key={l.to + l.label} to={l.to as any} onClick={() => setOpen(false)} className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs font-medium hover:bg-background">
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {(typing || (isLoading && msgs.length === 0)) && (
              <div className="flex">
                <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
                  <span className="support-bot-dot" /><span className="support-bot-dot" /><span className="support-bot-dot" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-3 [scrollbar-width:none]">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q.id} disabled={typing} onClick={() => reply(q.label, (d) => answerIntent(q.id, d))} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50">
                {q.label}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t border-border px-4 py-3">
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about firms, discounts..." aria-label="Type your question" className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button type="submit" aria-label="Send" disabled={!input.trim() || typing} className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <div className="flex items-center gap-3">
        {!open && (
          <span className="support-bot-badge hidden items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-1.5 text-xs font-semibold text-card-foreground shadow sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-success" /> Support • Online 24/7
          </span>
        )}
        <button aria-label={open ? "Close support chat" : "Open support chat"} onClick={() => setOpen((o) => !o)} className="support-bot-fab flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-105">
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}
