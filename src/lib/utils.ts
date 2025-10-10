/**
 * Utilitaires et fonctions helpers pour LaMap
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Initiative, GeoJSONPoint } from '@/types/initiative'

/**
 * Fusionne les classes Tailwind de manière intelligente
 * Évite les conflits de classes grâce à tailwind-merge
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate une date en français
 * 
 * @param date - Date à formater (string ISO ou Date)
 * @param format - Format de sortie
 * @returns Date formatée
 * 
 * @example
 * formatDate('2024-01-15T10:00:00Z') // => "15 janvier 2024"
 * formatDate(new Date(), 'short') // => "15/01/2024"
 */
export function formatDate(
  date: string | Date,
  format: 'long' | 'short' | 'relative' = 'long'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (format === 'short') {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj)
  }

  if (format === 'relative') {
    const now = new Date()
    const diffInMs = now.getTime() - dateObj.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Aujourd\'hui'
    if (diffInDays === 1) return 'Hier'
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
    if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`
    return `Il y a ${Math.floor(diffInDays / 365)} ans`
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Calcule la distance entre deux points géographiques (formule de Haversine)
 * 
 * @param point1 - Premier point [longitude, latitude]
 * @param point2 - Deuxième point [longitude, latitude]
 * @returns Distance en kilomètres
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
  const [lon1, lat1] = point1
  const [lon2, lat2] = point2

  const R = 6371 // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Arrondi à 1 décimale
}

/**
 * Convertit des degrés en radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Formate une distance de manière lisible
 * 
 * @param distanceKm - Distance en kilomètres
 * @returns Distance formatée avec unité
 * 
 * @example
 * formatDistance(0.5) // => "500 m"
 * formatDistance(15.3) // => "15,3 km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toLocaleString('fr-FR')} km`
}

/**
 * Extrait les coordonnées latitude/longitude d'un point GeoJSON
 * 
 * @param location - Point GeoJSON
 * @returns Objet { latitude, longitude }
 */
export function extractCoordinates(location: GeoJSONPoint): {
  latitude: number
  longitude: number
} {
  const [longitude, latitude] = location.coordinates
  return { latitude, longitude }
}

/**
 * Crée un point GeoJSON à partir de coordonnées
 * 
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns Point GeoJSON
 */
export function createGeoJSONPoint(
  latitude: number,
  longitude: number
): GeoJSONPoint {
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  }
}

/**
 * Valide un email
 * 
 * @param email - Email à valider
 * @returns true si valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide un numéro de téléphone français
 * 
 * @param phone - Numéro à valider
 * @returns true si valide
 */
export function isValidFrenchPhone(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return phoneRegex.test(phone)
}

/**
 * Formate un numéro de téléphone français
 * 
 * @param phone - Numéro brut
 * @returns Numéro formaté
 * 
 * @example
 * formatPhoneNumber('0123456789') // => "01 23 45 67 89"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('33')) {
    const withoutPrefix = cleaned.substring(2)
    return `+33 ${withoutPrefix.match(/.{1,2}/g)?.join(' ')}`
  }
  
  if (cleaned.length === 10) {
    return cleaned.match(/.{1,2}/g)?.join(' ') || phone
  }
  
  return phone
}

/**
 * Tronque un texte à une longueur donnée
 * 
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximum
 * @returns Texte tronqué avec "..."
 * 
 * @example
 * truncate('Un très long texte...', 10) // => "Un très lo..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Génère une couleur hexadécimale à partir d'une chaîne de caractères
 * Utile pour générer des couleurs cohérentes pour les utilisateurs, etc.
 * 
 * @param str - Chaîne de caractères
 * @returns Couleur hexadécimale
 * 
 * @example
 * stringToColor('user-123') // => "#a3c2f1"
 */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ('00' + value.toString(16)).slice(-2)
  }
  
  return color
}

/**
 * Debounce une fonction
 * 
 * @param func - Fonction à debouncer
 * @param wait - Délai en millisecondes
 * @returns Fonction debouncée
 * 
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle une fonction
 * 
 * @param func - Fonction à throttler
 * @param limit - Délai minimum entre deux appels en millisecondes
 * @returns Fonction throttlée
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Filtre les initiatives par distance par rapport à un point
 * 
 * @param initiatives - Liste des initiatives
 * @param center - Point central [longitude, latitude]
 * @param maxDistanceKm - Distance maximum en km
 * @returns Initiatives filtrées avec leur distance
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
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Groupe les initiatives par type
 * 
 * @param initiatives - Liste des initiatives
 * @returns Map avec le type comme clé et les initiatives comme valeur
 */
export function groupByType(
  initiatives: Initiative[]
): Map<string, Initiative[]> {
  return initiatives.reduce((acc, initiative) => {
    const type = initiative.type
    if (!acc.has(type)) {
      acc.set(type, [])
    }
    acc.get(type)?.push(initiative)
    return acc
  }, new Map<string, Initiative[]>())
}

/**
 * Copie un texte dans le presse-papiers
 * 
 * @param text - Texte à copier
 * @returns Promise<boolean> - true si succès
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
    return false
  }
}

/**
 * Génère une URL de partage pour une initiative
 * 
 * @param initiativeId - ID de l'initiative
 * @returns URL complète
 */
export function generateShareUrl(initiativeId: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/initiatives/${initiativeId}`
}

/**
 * Parse un paramètre de recherche URL
 * 
 * @param searchParams - URLSearchParams
 * @param key - Clé du paramètre
 * @param defaultValue - Valeur par défaut
 * @returns Valeur du paramètre ou valeur par défaut
 */
export function getSearchParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: string = ''
): string {
  return searchParams.get(key) || defaultValue
}

/**
 * Génère une description SEO pour une initiative
 * 
 * @param initiative - Initiative
 * @returns Description optimisée pour le SEO
 */
export function generateSEODescription(initiative: Initiative): string {
  const { name, type, address, description } = initiative
  
  let seoDescription = `${name} - ${type}`
  
  if (address) {
    seoDescription += ` situé à ${address}`
  }
  
  if (description) {
    seoDescription += `. ${truncate(description, 100)}`
  }
  
  return seoDescription
}

/**
 * Vérifie si le navigateur supporte la géolocalisation
 * 
 * @returns true si supporté
 */
export function supportsGeolocation(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

/**
 * Récupère la position géographique de l'utilisateur
 * 
 * @returns Promise<{ latitude: number; longitude: number }>
 */
export function getCurrentPosition(): Promise<{
  latitude: number
  longitude: number
}> {
  return new Promise((resolve, reject) => {
    if (!supportsGeolocation()) {
      reject(new Error('Géolocalisation non supportée'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  })
}
