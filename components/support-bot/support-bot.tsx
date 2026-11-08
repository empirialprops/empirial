"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Headphones, Send } from "lucide-react";
import { getFirms, getDeals, getChallenges, getEvents } from "@/lib/firebase/services";
import { welcome, type BotData, type BotReply } from "./answers";
import { QUICK_QUESTIONS, answerIntent, answerText } from "./intents";

type Msg = { role: "user" | "bot"; text: string; links?: BotReply["links"] };
const KEY = "empirial-support-chat";

let cachedData: BotData | null = null;
let dataFetchPromise: Promise<BotData> | null = null;

async function loadData(): Promise<BotData> {
  if (cachedData) return cachedData;
  if (!dataFetchPromise) {
    const safe = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[]);
    dataFetchPromise = Promise.all([
      safe(getFirms()),
      safe(getDeals()),
      safe(getChallenges()),
      safe(getEvents()),
    ]).then(([firms, deals, challenges, events]) => {
      cachedData = { firms, deals, challenges, events };
      return cachedData;
    });
  }
  return dataFetchPromise;
}

export function SupportBot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [data, setData] = useState<BotData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      setMsgs(saved ? JSON.parse(saved) : [{ role: "bot", ...welcome() }]);
    } catch {
      setMsgs([{ role: "bot", ...welcome() }]);
    }
  }, []);

  useEffect(() => {
    if (msgs.length) {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-50)));
      } catch {
        // ignore quota errors
      }
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open && !data) {
      setIsLoading(true);
      loadData()
        .then((d) => {
          setData(d);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [open, data]);

  const reply = useCallback((userText: string, build: (d: BotData) => BotReply) => {
    setMsgs((m) => [...m, { role: "user", text: userText }]);
    setTyping(true);
    const run = (d: BotData) => {
      setTimeout(() => {
        setMsgs((m) => [...m, { role: "bot", ...build(d) }]);
        setTyping(false);
        inputRef.current?.focus();
      }, 400);
    };
    if (data) {
      run(data);
    } else {
      loadData().then((d) => {
        setData(d);
        run(d);
      });
    }
  }, [data]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    reply(text, (d) => answerText(text, d));
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="support-bot fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 font-sans">
      {open && (
        <div
          role="dialog"
          aria-label="EMPIRIAL Support chat"
          className="support-bot-panel flex flex-col overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-zinc-100 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-xs">
              <Headphones className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight text-zinc-900 dark:text-white">
                EMPIRIAL Support
              </p>
              <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online • 24/7 • Instant replies
              </p>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages List */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 text-sm shadow-xs"
                      : "max-w-[90%] rounded-2xl rounded-bl-sm bg-zinc-100 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-800/80 px-4 py-3 text-sm shadow-xs"
                  }
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  {m.links?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.links.map((l) => (
                        <Link
                          key={l.to + l.label}
                          href={l.to}
                          onClick={() => setOpen(false)}
                          className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/90 px-3 py-1 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                        >
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
                <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 px-4 py-3">
                  <span className="support-bot-dot" />
                  <span className="support-bot-dot" />
                  <span className="support-bot-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions Horizon */}
          <div className="flex gap-2 overflow-x-auto border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 px-4 py-2.5 [scrollbar-width:none]">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                disabled={typing}
                onClick={() => reply(q.label, (d) => answerIntent(q.id, d))}
                className="shrink-0 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0A0A0A] px-4 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about firms, discounts..."
              aria-label="Type your question"
              className="h-11 flex-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all placeholder:text-zinc-400"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim() || typing}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button (FAB) and Hover Badge */}
      <div className="flex items-center gap-3">
        {!open && (
          <span className="support-bot-badge hidden items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 shadow-lg sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Support • Online 24/7
          </span>
        )}
        <button
          aria-label={open ? "Close support chat" : "Open support chat"}
          onClick={() => setOpen((o) => !o)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>
    </div>
  );
}

export default SupportBot;

