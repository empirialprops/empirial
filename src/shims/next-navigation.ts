import { notFound as tsNotFound, redirect as tsRedirect, useLocation, useNavigate, useRouter as useTsRouter } from "@tanstack/react-router";
import { useMemo } from "react";

export function useRouter() {
  const navigate = useNavigate();
  const router = useTsRouter();
  return useMemo(
    () => ({
      push: (href: string) => {
        if (/^https?:/.test(href)) window.location.href = href;
        else navigate({ href } as any);
      },
      replace: (href: string) => navigate({ href, replace: true } as any),
      back: () => router.history.back(),
      forward: () => router.history.forward(),
      refresh: () => router.invalidate(),
      prefetch: () => {},
    }),
    [navigate, router],
  );
}

export function usePathname() {
  return useLocation({ select: (l) => l.pathname });
}

export function useSearchParams() {
  const searchStr = useLocation({ select: (l) => l.searchStr });
  return useMemo(() => new URLSearchParams(searchStr), [searchStr]);
}

export function useParams() {
  return {} as Record<string, string>;
}

export function notFound(): never {
  throw tsNotFound();
}

export function redirect(href: string): never {
  throw tsRedirect({ href } as any);
}
