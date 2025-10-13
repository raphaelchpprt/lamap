/**
 * Utilities and helper functions for LaMap
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Initiative, GeoJSONPoint } from '@/types/initiative';

/**
 * Merge Tailwind classes intelligently
 * Avoids class conflicts using tailwind-merge
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date in French locale
 *
 * @param date - Date to format (ISO string or Date object)
 * @param format - Output format
 * @returns Formatted date
 *
 * @example
 * formatDate('2024-01-15T10:00:00Z') // => "15 janvier 2024"
 * formatDate(new Date(), 'short') // => "15/01/2024"
 */
export function formatDate(
  date: string | Date,
  format: 'long' | 'short' | 'relative' = 'long'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  }

  if (format === 'relative') {
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
    return `Il y a ${Math.floor(diffInDays / 365)} ans`;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Calculate distance between two geographic points (Haversine formula)
 *
 * @param point1 - First point [longitude, latitude]
 * @param point2 - Second point [longitude, latitude]
 * @returns Distance in kilometers
 *
 * @example
 * const paris = [2.3522, 48.8566]
 * const lyon = [4.8357, 45.7640]
 * calculateDistance(paris, lyon) // => ~392 km
 */
export function calculateDistance(
  point1: [number, number],
  point2: [number, number]
): number {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance in a readable way
 *
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance with unit
 *
 * @example
 * formatDistance(0.5) // => "500 m"
 * formatDistance(15.3) // => "15,3 km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toLocaleString('fr-FR')} km`;
}

/**
 * Extract latitude/longitude coordinates from a GeoJSON point
 *
 * @param location - GeoJSON Point
 * @returns Object { latitude, longitude }
 */
export function extractCoordinates(location: GeoJSONPoint): {
  latitude: number;
  longitude: number;
} {
  const [longitude, latitude] = location.coordinates;
  return { latitude, longitude };
}

/**
 * Create a GeoJSON point from coordinates
 *
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns GeoJSON Point
 */
export function createGeoJSONPoint(
  latitude: number,
  longitude: number
): GeoJSONPoint {
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
}

/**
 * Validate an email address
 *
 * @param email - Email to validate
 * @returns true if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a French phone number
 *
 * @param phone - Phone number to validate
 * @returns true if valid
 */
export function isValidFrenchPhone(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

/**
 * Format a French phone number
 *
 * @param phone - Raw phone number
 * @returns Formatted phone number
 *
 * @example
 * formatPhoneNumber('0123456789') // => "01 23 45 67 89"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('33')) {
    const withoutPrefix = cleaned.substring(2);
    return `+33 ${withoutPrefix.match(/.{1,2}/g)?.join(' ')}`;
  }

  if (cleaned.length === 10) {
    return cleaned.match(/.{1,2}/g)?.join(' ') || phone;
  }

  return phone;
}

/**
 * Truncate text to a given length
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with "..."
 *
 * @example
 * truncate('Un très long texte...', 10) // => "Un très lo..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate a hexadecimal color from a string
 * Useful for generating consistent colors for users, etc.
 *
 * @param str - Input string
 * @returns Hexadecimal color
 *
 * @example
 * stringToColor('user-123') // => "#a3c2f1"
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }

  return color;
}

/**
 * Debounce a function (delays execution until calls stop)
 *
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300)
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function (limits number of calls per period)
 *
 * @param func - Function to throttle
 * @param limit - Minimum delay between two calls in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Filter initiatives by distance from a point
 *
 * @param initiatives - List of initiatives
 * @param center - Center point [longitude, latitude]
 * @param maxDistanceKm - Maximum distance in km
 * @returns Filtered initiatives with their distance
 */
export function filterByDistance(
  initiatives: Initiative[],
  center: [number, number],
  maxDistanceKm: number
): Array<Initiative & { distance: number }> {
  return initiatives
    .map((initiative) => ({
      ...initiative,
      distance: calculateDistance(center, initiative.location.coordinates),
    }))
    .filter((initiative) => initiative.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Group initiatives by type
 *
 * @param initiatives - List of initiatives
 * @returns Map with type as key and initiatives as value
 */
export function groupByType(
  initiatives: Initiative[]
): Map<string, Initiative[]> {
  return initiatives.reduce((acc, initiative) => {
    const type = initiative.type;
    if (!acc.has(type)) {
      acc.set(type, []);
    }
    acc.get(type)?.push(initiative);
    return acc;
  }, new Map<string, Initiative[]>());
}

/**
 * Copy text to clipboard
 *
 * @param text - Text to copy
 * @returns Promise<boolean> - true if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    return false;
  }
}

/**
 * Generate a share URL for an initiative
 *
 * @param initiativeId - Initiative ID
 * @returns Complete URL
 */
export function generateShareUrl(initiativeId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/initiatives/${initiativeId}`;
}

/**
 * Parse a URL search parameter
 *
 * @param searchParams - URLSearchParams
 * @param key - Parameter key
 * @param defaultValue - Default value
 * @returns Parameter value or default value
 */
export function getSearchParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: string = ''
): string {
  return searchParams.get(key) || defaultValue;
}

/**
 * Generate an SEO description for an initiative
 *
 * @param initiative - Initiative
 * @returns SEO-optimized description
 */
export function generateSEODescription(initiative: Initiative): string {
  const { name, type, address, description } = initiative;

  let seoDescription = `${name} - ${type}`;

  if (address) {
    seoDescription += ` situé à ${address}`;
  }

  if (description) {
    seoDescription += `. ${truncate(description, 100)}`;
  }

  return seoDescription;
}

/**
 * Check if browser supports geolocation
 *
 * @returns true if supported
 */
export function supportsGeolocation(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Get user's geographic position
 *
 * @returns Promise<{ latitude: number; longitude: number }>
 */
export function getCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!supportsGeolocation()) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}
