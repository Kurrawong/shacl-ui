import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sortWithNulls(a: number | null, b: number | null) {
  if (a === null) {
    return 1
  }
  if (b === null) {
    return -1
  }
  return (a || 0) - (b || 0)
}
