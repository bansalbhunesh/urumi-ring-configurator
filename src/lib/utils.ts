import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* The shadcn class-merge helper. clsx resolves conditionals, tailwind-merge
   dedupes conflicting Tailwind utilities so the last one wins (e.g. a passed
   `bg-transparent` cleanly overrides a component's default `bg-card`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
