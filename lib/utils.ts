import { type ClassValue, clsx } from 'clsx';

// Simple cn utility for combining class names
// Works without tailwind-merge for basic use cases
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
