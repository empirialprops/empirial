import { Link as RouterLink } from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | { pathname?: string; query?: Record<string, string> };
  prefetch?: boolean;
  scroll?: boolean;
  replace?: boolean;
  children?: ReactNode;
};

const Link = forwardRef<HTMLAnchorElement, Props>(function Link(
  { href, prefetch: _p, scroll: _s, replace, ...rest },
  ref,
) {
  let url =
    typeof href === "string"
      ? href
      : (href.pathname ?? "/") + (href.query ? "?" + new URLSearchParams(href.query).toString() : "");
  const external = /^(https?:|mailto:|tel:|#)/.test(url) || rest.target === "_blank";
  if (external) return <a ref={ref} href={url} {...rest} />;
  const [path, hashPart] = url.split("#");
  const [pathname, search] = path.split("?");
  return (
    <RouterLink
      ref={ref}
      // Untyped legacy hrefs from the original site.
      to={(pathname || "/") as any}
      search={search ? (Object.fromEntries(new URLSearchParams(search)) as any) : undefined}
      hash={hashPart}
      replace={replace}
      {...(rest as any)}
    />
  );
});

export default Link;
