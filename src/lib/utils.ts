import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared by App (history badges) and TicketHeader (priority pill); the two
// copies were identical and could drift apart.
export function getPriorityColors(priority: string) {
  const p = priority?.toLowerCase() || '';
  if (p.includes('critical')) return 'bg-rose-100 text-rose-700 border-rose-200';
  if (p.includes('high')) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (p.includes('medium')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (p.includes('low')) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}
