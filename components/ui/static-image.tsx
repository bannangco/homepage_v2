import { createElement } from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { StaticImageData } from "next/image";

type StaticImageProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  src: string | StaticImageData;
  fill?: boolean;
  priority?: boolean;
};

export default function StaticImage({
  src,
  alt,
  fill = false,
  priority = false,
  className = "",
  height,
  width,
  ...props
}: StaticImageProps) {
  const source = typeof src === "string" ? { src } : src;
  const intrinsicWidth = "width" in source ? source.width : undefined;
  const intrinsicHeight = "height" in source ? source.height : undefined;
  const fillClasses = fill ? "absolute inset-0 h-full w-full" : "";

  return createElement("img", {
    ...props,
    alt,
    src: source.src,
    width: fill ? undefined : (width ?? intrinsicWidth),
    height: fill ? undefined : (height ?? intrinsicHeight),
    className: `${fillClasses} ${className}`.trim(),
    decoding: props.decoding ?? "async",
    loading: priority ? "eager" : (props.loading ?? "lazy"),
    fetchPriority: priority ? "high" : props.fetchPriority,
  });
}
