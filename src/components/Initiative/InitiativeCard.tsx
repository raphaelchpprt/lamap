'use client';

/**
 * Initiative ESS Card Component
 *
 * Displays information about an initiative with modern glassmorphism design.
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
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { TYPE_GRADIENTS } from '@/types/initiative';

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
 * Initiative type badge with gradient matching FilterPanel
 */
function TypeBadge({ type }: { type: Initiative['type'] }) {
  const gradient = TYPE_GRADIENTS[type];

  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg backdrop-blur-sm bg-gradient-to-r ${gradient}`}
    >
      <Sparkles className="h-3 w-3" />
      {type}
    </div>
  );
}

/**
 * Verification badge with glassmorphism and pulse animation
 */
function VerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified) return null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg animate-pulse-subtle"
      style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
      }}
      title="Initiative vérifiée par l'équipe LaMap"
    >
      <Check className="h-3.5 w-3.5" />
      <span>Vérifiée</span>
    </div>
  );
}

/**
 * Open/Closed status badge with animation
 */
function OpenStatusBadge({
  openingHours,
}: {
  openingHours: OpeningHours | undefined;
}) {
  const isOpen = isOpenNow(openingHours);

  if (!openingHours) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${
        isOpen ? 'animate-pulse-subtle' : ''
      }`}
      style={{
        background: isOpen
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        boxShadow: isOpen
          ? '0 4px 12px rgba(16, 185, 129, 0.4)'
          : '0 4px 12px rgba(239, 68, 68, 0.4)',
      }}
      title={
        isOpen
          ? "Actuellement ouvert selon les horaires d'ouverture"
          : "Actuellement fermé selon les horaires d'ouverture"
      }
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{isOpen ? 'Ouvert' : 'Fermé'}</span>
    </div>
  );
}

/**
 * Quick contact information with glassmorphism
 */
function QuickContact({ initiative }: { initiative: Initiative }) {
  const hasContact = initiative.phone || initiative.email || initiative.website;

  if (!hasContact) return null;

  return (
    <div className="flex items-center gap-2">
      {initiative.phone && (
        <a
          href={`tel:${initiative.phone}`}
          className="p-2 glass rounded-lg hover:glass-strong transition-all duration-300 hover:scale-110"
          title="Appeler"
        >
          <Phone size={16} className="text-emerald-400" />
        </a>
      )}

      {initiative.email && (
        <a
          href={`mailto:${initiative.email}`}
          className="p-2 glass rounded-lg hover:glass-strong transition-all duration-300 hover:scale-110"
          title="Envoyer un email"
        >
          <Mail size={16} className="text-blue-400" />
        </a>
      )}

      {initiative.website && (
        <a
          href={initiative.website}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 glass rounded-lg hover:glass-strong transition-all duration-300 hover:scale-110 flex items-center gap-1"
          title="Visiter le site web"
        >
          <Globe size={16} className="text-white/80" />
          <ExternalLink size={12} className="text-white/60" />
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

  // CSS classes based on variant with modern glassmorphism (white background)
  const variantClasses = {
    card: 'rounded-2xl border border-white/50 overflow-hidden transition-all duration-300 hover:scale-[1.02]',
    popup: 'rounded-2xl border border-white/60 overflow-hidden max-w-sm',
    list: 'rounded-xl border border-white/50 hover:border-white/70 transition-all duration-300',
    detailed: 'rounded-2xl border border-white/60',
  };

  // Shadow styles with green glow
  const shadowStyles = {
    card: {
      boxShadow:
        '0 8px 32px rgba(16, 185, 129, 0.2), 0 4px 16px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(24px) saturate(180%)',
    },
    popup: {
      boxShadow:
        '0 12px 40px rgba(16, 185, 129, 0.25), 0 6px 20px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.7) inset',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(28px) saturate(180%)',
    },
    list: {
      boxShadow:
        '0 4px 16px rgba(16, 185, 129, 0.15), 0 2px 8px rgba(16, 185, 129, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
      background: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(20px) saturate(180%)',
    },
    detailed: {
      boxShadow:
        '0 12px 40px rgba(16, 185, 129, 0.25), 0 6px 20px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.7) inset',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(28px) saturate(180%)',
    },
  };

  const containerClass = `${variantClasses[variant]} ${className}`;
  const containerStyle = shadowStyles[variant];

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
        style={containerStyle}
        onClick={handleClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <TypeBadge type={initiative.type} />
                <VerifiedBadge verified={initiative.verified} />
                <OpenStatusBadge openingHours={initiative.opening_hours} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                {initiative.name}
              </h3>

              {initiative.address && (
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <MapPin
                    size={14}
                    className="flex-shrink-0 text-emerald-600"
                  />
                  <span className="truncate">{initiative.address}</span>
                  {distance && (
                    <span className="ml-2 text-emerald-600 font-semibold">
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
      <div className={containerClass} style={containerStyle}>
        {/* Image with gradient overlay */}
        {initiative.image_url && !imageError && (
          <div className="relative h-32 w-full">
            <Image
              src={initiative.image_url}
              alt={initiative.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay for better badge visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

            {/* Badges positioned on image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <TypeBadge type={initiative.type} />
              <VerifiedBadge verified={initiative.verified} />
              <OpenStatusBadge openingHours={initiative.opening_hours} />
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Badges if no image */}
          {(!initiative.image_url || imageError) && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <TypeBadge type={initiative.type} />
              <VerifiedBadge verified={initiative.verified} />
              <OpenStatusBadge openingHours={initiative.opening_hours} />
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {initiative.name}
          </h3>

          {initiative.address && (
            <div className="flex items-center gap-1.5 mb-2 text-sm text-gray-700">
              <MapPin size={14} className="flex-shrink-0 text-emerald-600" />
              <span>{initiative.address}</span>
            </div>
          )}

          {distance && (
            <div className="text-sm text-emerald-600 font-semibold mb-3">
              À {formatDistance(distance)}
            </div>
          )}

          {description && (
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {truncatedDescription}
            </p>
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
      style={containerStyle}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header image with glassmorphism overlay */}
      {initiative.image_url && !imageError && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={initiative.image_url}
            alt={initiative.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />

          {/* Gradient overlay for better badge visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

          {/* Badges positioned on image with glassmorphism */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <TypeBadge type={initiative.type} />
            <VerifiedBadge verified={initiative.verified} />
            <OpenStatusBadge openingHours={initiative.opening_hours} />
          </div>
        </div>
      )}

      {/* Main content with glassmorphism background */}
      <div className="p-6 space-y-5">
        {/* Header: Type badge + Verified (if no image) */}
        {(!initiative.image_url || imageError) && (
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={initiative.type} />
            <VerifiedBadge verified={initiative.verified} />
            <OpenStatusBadge openingHours={initiative.opening_hours} />
          </div>
        )}

        {/* Main title - modern dark text */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {initiative.name}
          </h2>
        </div>

        {/* Address and distance with icons */}
        {initiative.address && (
          <div
            className="flex items-start gap-3 p-3.5 rounded-xl"
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <MapPin
              size={18}
              className="flex-shrink-0 mt-0.5 text-emerald-600"
            />
            <div className="flex-1">
              <p className="text-sm leading-relaxed text-gray-800 font-medium">
                {initiative.address}
              </p>
              {distance && (
                <p className="text-sm font-bold text-emerald-600 mt-1.5">
                  📍 À {formatDistance(distance)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700 leading-relaxed">
              {truncatedDescription}
            </p>
            {description.length > 120 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
              >
                {showFullDescription ? '− Voir moins' : '+ Voir plus'}
              </button>
            )}
          </div>
        )}

        {/* Opening hours (only for detailed variant) */}
        {variant === 'detailed' && initiative.opening_hours && (
          <div
            className="p-4 rounded-xl space-y-3"
            style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Clock size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold text-gray-900">
                Horaires d&apos;ouverture
              </span>
              {isOpen ? (
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-bold text-white animate-pulse-subtle"
                  style={{
                    background:
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  • Ouvert maintenant
                </span>
              ) : (
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-bold text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  • Fermé
                </span>
              )}
            </div>
            <pre className="text-xs text-gray-700 whitespace-pre-line leading-relaxed font-sans">
              {formatOpeningHours(initiative.opening_hours)}
            </pre>
          </div>
        )}

        {/* Contact with modern buttons */}
        {(initiative.website || initiative.phone || initiative.email) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold text-gray-900">
                Contact
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {initiative.website && (
                <a
                  href={initiative.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium text-gray-700 hover:scale-105 hover:text-gray-900"
                  style={{
                    background: 'rgba(148, 163, 184, 0.12)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe size={16} />
                  <span>Site web</span>
                  <ExternalLink size={12} />
                </a>
              )}

              {initiative.phone && (
                <a
                  href={`tel:${initiative.phone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:scale-105 transition-all duration-300"
                  style={{
                    background:
                      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone size={16} />
                  <span>{initiative.phone}</span>
                </a>
              )}

              {initiative.email && (
                <a
                  href={`mailto:${initiative.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:scale-105 transition-all duration-300"
                  style={{
                    background:
                      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail size={16} />
                  <span>{initiative.email}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Admin actions with modern styling */}
        {showActions && (onEdit || onDelete) && (
          <div
            className="pt-3 flex items-center gap-2 border-t"
            style={{ borderColor: 'rgba(148, 163, 184, 0.2)' }}
          >
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(initiative);
                }}
                className="px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium hover:scale-105"
                style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  color: '#1e40af',
                }}
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
                className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:scale-105 transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                }}
              >
                🗑️ Supprimer
              </button>
            )}
          </div>
        )}

        {/* Metadata (only for detailed variant) */}
        {variant === 'detailed' && (
          <div
            className="pt-3 border-t"
            style={{ borderColor: 'rgba(148, 163, 184, 0.2)' }}
          >
            <div className="flex items-center justify-between text-xs text-gray-600">
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
