// Minimal stand-ins for next/image, next/script, next and next/server used by the original site.
import { useEffect, type ImgHTMLAttributes } from "react";

type ImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  unoptimized?: boolean;
  placeholder?: string;
  blurDataURL?: string;
  src: any;
};

export default function Image({ fill, priority: _p, quality: _q, unoptimized: _u, placeholder: _ph, blurDataURL: _b, style, src, ...rest }: ImgProps) {
  const s = typeof src === "string" ? src : src?.src;
  return (
    <img
      src={s}
      loading={_p ? "eager" : "lazy"}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}
      {...rest}
    />
  );
}

export function Script({ src, id, dangerouslySetInnerHTML }: { src?: string; id?: string; strategy?: string; dangerouslySetInnerHTML?: { __html: string } }) {
  useEffect(() => {
    if (id && document.getElementById(id)) return;
    const el = document.createElement("script");
    if (id) el.id = id;
    if (src) {
      el.src = src;
      el.async = true;
    }
    if (dangerouslySetInnerHTML) el.innerHTML = dangerouslySetInnerHTML.__html;
    document.body.appendChild(el);
  }, [src, id, dangerouslySetInnerHTML]);
  return null;
}

export type Metadata = Record<string, any>;
export type MetadataRoute = any;
