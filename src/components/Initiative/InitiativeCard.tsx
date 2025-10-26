'use client';

/**
 * Initiative ESS Card Component
 *
 * Displays information about an initiative in a compact and attractive way.
 * Supports different display modes (card, popup, list).
 */

import {
  MapPin,
  Clock,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { INITIATIVE_COLORS } from '@/types/initiative';

import type { Initiative, OpeningHours } from '@/types/initiative';

// ================================
// TYPES
// ================================

interface InitiativeCardProps {
  /** Initiative data */
  initiative: Initiative;

  /** Display variant */
  variant?: 'card' | 'popup' | 'list' | 'detailed';

  /** Custom CSS classes */
  className?: string;

  /** Show distance if available */
  distance?: number;

  /** Click callback on card */
  onClick?: (initiative: Initiative) => void;

  /** Show edit actions */
  showActions?: boolean;

  /** Edit callback */
  onEdit?: (initiative: Initiative) => void;

  /** Delete callback */
  onDelete?: (initiative: Initiative) => void;
}

// ================================
// UTILITIES
// ================================

/**
 * Format distance as readable text
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Determine if initiative is currently open
 */
function isOpenNow(openingHours: OpeningHours | undefined): boolean {
  if (!openingHours) return false;

  const now = new Date();
  const day = now
    .toLocaleDateString('fr-FR', { weekday: 'long' })
    .toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  const dayMapping: Record<string, keyof OpeningHours> = {
    lundi: 'monday',
    mardi: 'tuesday',
    mercredi: 'wednesday',
    jeudi: 'thursday',
    vendredi: 'friday',
    samedi: 'saturday',
    dimanche: 'sunday',
  };

  const mappedDay = dayMapping[day];
  if (!mappedDay) return false;

  const todayHours = openingHours[mappedDay];
  if (!todayHours) return false;

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

/**
 * Format opening hours for display
 */
function formatOpeningHours(openingHours: OpeningHours | undefined): string {
  if (!openingHours) return 'Hours not provided';

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const hoursText = days
    .map((day, index) => {
      const hours = openingHours[day as keyof OpeningHours];
      if (!hours) return `${dayNames[index]}: Fermé`;
      return `${dayNames[index]}: ${hours.open}-${hours.close}`;
    })
    .join('\n');

  return hoursText;
}

// ================================
// COMPONENTS
// ================================

/**
 * Initiative type badge
 */
function TypeBadge({ type }: { type: Initiative['type'] }) {
  const color = INITIATIVE_COLORS[type];

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {type}
    </span>
  );
}

/**
 * Verification badge
 */
function VerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified) return null;

  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
      title="Initiative vérifiée par l'équipe LaMap"
    >
      <Check size={12} />
      <span>Vérifiée</span>
    </div>
  );
}

/**
 * Quick contact information
 */
function QuickContact({ initiative }: { initiative: Initiative }) {
  const hasContact = initiative.phone || initiative.email || initiative.website;

  if (!hasContact) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {initiative.phone && (
        <a
          href={`tel:${initiative.phone}`}
          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
          title="Appeler"
        >
          <Phone size={14} />
        </a>
      )}

      {initiative.email && (
        <a
          href={`mailto:${initiative.email}`}
          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
          title="Envoyer un email"
        >
          <Mail size={14} />
        </a>
      )}

      {initiative.website && (
        <a
          href={initiative.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary-600 transition-colors"
          title="Visiter le site web"
        >
          <Globe size={14} />
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}

// ================================
// MAIN COMPONENT
// ================================

export default function InitiativeCard({
  initiative,
  variant = 'card',
  className = '',
  distance,
  onClick,
  showActions = false,
  onEdit,
  onDelete,
}: InitiativeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // CSS classes based on variant
  const variantClasses = {
    card: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden',
    popup: 'bg-white rounded-lg shadow-lg overflow-hidden max-w-sm',
    list: 'bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors',
    detailed: 'bg-white rounded-lg shadow-sm border border-gray-200',
  };

  const containerClass = `${variantClasses[variant]} ${className}`;

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick(initiative);
    }
  };

  // Truncated description text
  const description = initiative.description || '';
  const truncatedDescription =
    description.length > 120 && !showFullDescription
      ? `${description.slice(0, 120)}...`
      : description;

  const isOpen = isOpenNow(initiative.opening_hours);

  // ================================
  // VARIANT LIST
  // ================================

  if (variant === 'list') {
    return (
      <div
        className={containerClass}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <TypeBadge type={initiative.type} />
                <VerifiedBadge verified={initiative.verified} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {initiative.name}
              </h3>

              {initiative.address && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span className="truncate">{initiative.address}</span>
                  {distance && (
                    <span className="ml-2 text-primary-600 font-medium">
                      • {formatDistance(distance)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <QuickContact initiative={initiative} />
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // VARIANT POPUP
  // ================================

  if (variant === 'popup') {
    return (
      <div className={containerClass}>
        {/* Image */}
        {initiative.image_url && !imageError && (
          <div className="relative h-32 w-full">
            <Image
              src={initiative.image_url}
              alt={initiative.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <TypeBadge type={initiative.type} />
            <VerifiedBadge verified={initiative.verified} />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {initiative.name}
          </h3>

          {initiative.address && (
            <div className="flex items-center gap-1 mb-2 text-sm text-gray-600">
              <MapPin size={14} />
              <span>{initiative.address}</span>
            </div>
          )}

          {distance && (
            <div className="text-sm text-primary-600 font-medium mb-2">
              À {formatDistance(distance)}
            </div>
          )}

          {description && (
            <p className="text-sm text-gray-600 mb-3">{truncatedDescription}</p>
          )}

          <QuickContact initiative={initiative} />
        </div>
      </div>
    );
  }

  // ================================
  // VARIANT CARD & DETAILED
  // ================================

  return (
    <div
      className={containerClass}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header image */}
      {initiative.image_url && !imageError && (
        <div className="relative h-48 w-full">
          <Image
            src={initiative.image_url}
            alt={initiative.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />

          {/* Overlay with type badge only */}
          <div className="absolute top-3 left-3 flex gap-2">
            <TypeBadge type={initiative.type} />
            {initiative.verified && <VerifiedBadge verified={true} />}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="p-6 space-y-4">
        {/* Header: Type badge + Verified (if no image) */}
        {(!initiative.image_url || imageError) && (
          <div className="flex items-center gap-2">
            <TypeBadge type={initiative.type} />
            {initiative.verified && <VerifiedBadge verified={true} />}
          </div>
        )}

        {/* Main title - larger and clearer */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {initiative.name}
          </h2>
        </div>

        {/* Address and distance */}
        {initiative.address && (
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin size={18} className="flex-shrink-0 mt-0.5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm leading-relaxed">{initiative.address}</p>
              {distance && (
                <p className="text-sm font-semibold text-primary-600 mt-1">
                  À {formatDistance(distance)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {truncatedDescription}
            </p>
            {description.length > 120 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-2 transition-colors"
              >
                {showFullDescription ? '− Voir moins' : '+ Voir plus'}
              </button>
            )}
          </div>
        )}

        {/* Opening hours (only for detailed variant) */}
        {variant === 'detailed' && initiative.opening_hours && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-primary-600" />
              <span className="text-sm font-semibold text-gray-900">
                Horaires d&apos;ouverture
              </span>
              {isOpen && (
                <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">
                  • Ouvert maintenant
                </span>
              )}
            </div>
            <pre className="text-xs text-gray-600 whitespace-pre-line leading-relaxed font-sans">
              {formatOpeningHours(initiative.opening_hours)}
            </pre>
          </div>
        )}

        {/* Contact */}
        {(initiative.website || initiative.phone || initiative.email) && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={18} className="text-primary-600" />
              <span className="text-sm font-semibold text-gray-900">
                Contact
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {initiative.website && (
                <a
                  href={initiative.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe size={16} />
                  <span>Site web</span>
                  <ExternalLink size={14} />
                </a>
              )}

              {initiative.phone && (
                <a
                  href={`tel:${initiative.phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone size={16} />
                  <span>{initiative.phone}</span>
                </a>
              )}

              {initiative.email && (
                <a
                  href={`mailto:${initiative.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail size={16} />
                  <span>{initiative.email}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Admin actions */}
        {showActions && (onEdit || onDelete) && (
          <div className="border-t border-gray-100 pt-4 flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(initiative);
                }}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                ✏️ Éditer
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(initiative);
                }}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                🗑️ Supprimer
              </button>
            )}
          </div>
        )}

        {/* Metadata (only for detailed variant) */}
        {variant === 'detailed' && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                📅 Ajouté le{' '}
                {new Date(initiative.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {initiative.updated_at !== initiative.created_at && (
                <span className="flex items-center gap-1">
                  ✏️ Modifié le{' '}
                  {new Date(initiative.updated_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
