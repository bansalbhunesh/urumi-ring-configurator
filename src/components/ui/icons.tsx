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
      {stone === "cushion" && (
        <g>
          <rect x="7" y="7" width="26" height="26" rx="6" />
          <rect x="13" y="13" width="14" height="14" rx="3" />
          <path d="M7 20h26M20 7v26M10 10l20 20M30 10 10 30" />
        </g>
      )}
      {stone === "emerald" && (
        <g>
          <path d="M12 5h16l7 7v16l-7 7H12l-7-7V12l7-7Z" />
          <rect x="13" y="10" width="14" height="20" />
          <path d="M8 15h24M8 25h24" />
        </g>
      )}
      {stone === "radiant" && (
        <g>
          <path d="M11 6h18l5 5v18l-5 5H11l-5-5V11l5-5Z" />
          <path d="M20 6v28M6 20h28M10 10l20 20M30 10 10 30" />
        </g>
      )}
      {stone === "pear" && (
        <g>
          <path d="M20 5C12 14 9 21 10 27c1 6 6 10 10 10s9-4 10-10c1-6-2-13-10-22Z" />
          <path d="M20 5v32M11 25h18M13 13l16 23M27 13 13 36" />
        </g>
      )}
      {stone === "marquise" && (
        <g>
          <path d="M20 4C10 11 7 17 7 20s3 9 13 16c10-7 13-13 13-16S30 11 20 4Z" />
          <ellipse cx="20" cy="20" rx="6" ry="13" />
          <path d="M20 4v32M9 20h22" />
        </g>
      )}
      {stone === "heart" && (
        <g>
          <path d="M20 34 8 22C2 16 6 7 13 7c3 0 5 1.7 7 4.2C22 8.7 24 7 27 7c7 0 11 9 5 15L20 34Z" />
          <path d="M20 11v23M8 20h24M11 11l21 21M29 11 8 32" />
        </g>
      )}
      {stone === "asscher" && (
        <g>
          <path d="M11 6h18l5 5v18l-5 5H11l-5-5V11l5-5Z" />
          <path d="M14 11h12l3 3v12l-3 3H14l-3-3V14l3-3Z" />
          <path d="M11 6l3 5M29 6l-3 5M6 11l5 3M34 11l-5 3M6 29l5-3M34 29l-5-3M11 34l3-5M29 34l-3-5" />
        </g>
      )}
    </svg>
  );
}
