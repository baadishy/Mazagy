import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-numeric characters
  let clean = phone.replace(/\D/g, '');
  
  // Egyptian numbers usually start with 01. 
  // For WhatsApp, we need the country code 20.
  // If they have 01234567890, adding '2' to the front makes it 201234567890.
  if (clean.startsWith('01')) {
    return '2' + clean;
  }
  
  // If it starts with 1 (missing the 0), add 20
  if (clean.startsWith('1') && clean.length === 10) {
    return '20' + clean;
  }
  
  // If it already starts with 20, it's good
  if (clean.startsWith('20')) {
    return clean;
  }

  // Fallback: ensure it starts with 2
  if (!clean.startsWith('2')) {
    return '2' + clean;
  }
  
  return clean;
}

export function formatDisplayPhone(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  
  // Egyptian format: 01x xxxx xxxx
  if (clean.length === 11 && clean.startsWith('01')) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`;
  }
  
  // If missing the 0
  if (clean.length === 10 && clean.startsWith('1')) {
    return `0${clean.slice(0, 2)} ${clean.slice(2, 6)} ${clean.slice(6)}`;
  }
  
  return phone;
}
