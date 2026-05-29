import type { SVGProps } from "react";
import type { StoneId } from "@/lib/types";

export function BagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} {...props}>
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
      <path d="m5 12 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Small line-art glyphs for each diamond cut, used in the stone picker. */
export function StoneGlyph({ stone, ...props }: { stone: StoneId } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth={1.1} {...props}>
      {stone === "round" && (
        <g>
          <circle cx="20" cy="20" r="13" />
          <circle cx="20" cy="20" r="8" />
          <path d="M20 7v5M20 28v5M7 20h5M28 20h5M11 11l3.5 3.5M29 11l-3.5 3.5M11 29l3.5-3.5M29 29l-3.5-3.5" />
        </g>
      )}
      {stone === "oval" && (
        <g>
          <ellipse cx="20" cy="20" rx="10" ry="14" />
          <ellipse cx="20" cy="20" rx="6" ry="9" />
          <path d="M20 6v6M20 28v6M10 20h4M26 20h4" />
        </g>
      )}
      {stone === "princess" && (
        <g>
          <rect x="8" y="8" width="24" height="24" rx="1.5" />
          <rect x="13" y="13" width="14" height="14" rx="1" />
          <path d="m8 8 5 5M32 8l-5 5M8 32l5-5M32 32l-5-5" />
        </g>
      )}
    </svg>
  );
}
