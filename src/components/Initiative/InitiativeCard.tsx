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
  /** Données de l'initiative */
  initiative: Initiative;

  /** Variant d'affichage */
  variant?: 'card' | 'popup' | 'list' | 'detailed';

  /** Classes CSS personnalisées */
  className?: string;

  /** Afficher la distance si disponible */
  distance?: number;

  /** Callback au clic sur la carte */
  onClick?: (initiative: Initiative) => void;

  /** Afficher les actions d'édition */
  showActions?: boolean;

  /** Callback pour éditer */
  onEdit?: (initiative: Initiative) => void;

  /** Callback pour supprimer */
  onDelete?: (initiative: Initiative) => void;
}

// ================================
// UTILITAIRES
// ================================

/**
 * Formate la distance en texte lisible
 */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Détermine si l'initiative est ouverte maintenant
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
 * Formate les horaires pour affichage
 */
function formatOpeningHours(openingHours: OpeningHours | undefined): string {
  if (!openingHours) return 'Horaires non renseignés';

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
// COMPOSANTS
// ================================

/**
 * Badge de type d'initiative
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
 * Badge de vérification
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
 * Informations de contact rapide
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
// COMPOSANT PRINCIPAL
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

  // Classes CSS selon le variant
  const variantClasses = {
    card: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden',
    popup: 'bg-white rounded-lg shadow-lg overflow-hidden max-w-sm',
    list: 'bg-white rounded-md border border-gray-200 hover:border-gray-300 transition-colors',
    detailed: 'bg-white rounded-lg shadow-sm border border-gray-200',
  };

  const containerClass = `${variantClasses[variant]} ${className}`;

  // Gestion du clic
  const handleClick = () => {
    if (onClick) {
      onClick(initiative);
    }
  };

  // Texte de description tronqué
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
      {/* Image d'en-tête */}
      {initiative.image_url && !imageError && (
        <div className="relative h-48 w-full">
          <Image
            src={initiative.image_url}
            alt={initiative.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />

          {/* Overlay avec badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <TypeBadge type={initiative.type} />
            <VerifiedBadge verified={initiative.verified} />
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="p-4">
        {/* En-tête sans image */}
        {(!initiative.image_url || imageError) && (
          <div className="flex items-center justify-between mb-3">
            <TypeBadge type={initiative.type} />
            <VerifiedBadge verified={initiative.verified} />
          </div>
        )}

        {/* Titre */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {initiative.name}
        </h3>

        {/* Adresse et distance */}
        <div className="space-y-2 mb-3">
          {initiative.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} className="flex-shrink-0" />
              <span>{initiative.address}</span>
            </div>
          )}

          {distance && (
            <div className="text-sm text-primary-600 font-medium">
              À {formatDistance(distance)}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {truncatedDescription}
            </p>
            {description.length > 120 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 mt-1"
              >
                {showFullDescription ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )}

        {/* Horaires pour variant detailed */}
        {variant === 'detailed' && initiative.opening_hours && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Horaires
              </span>
              {isOpen && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Ouvert
                </span>
              )}
            </div>
            <pre className="text-xs text-gray-600 whitespace-pre-line">
              {formatOpeningHours(initiative.opening_hours)}
            </pre>
          </div>
        )}

        {/* Contact */}
        <div className="flex items-center justify-between">
          <QuickContact initiative={initiative} />

          {/* Actions d'administration */}
          {showActions && (onEdit || onDelete) && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(initiative);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
                >
                  Éditer
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(initiative);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded"
                >
                  Supprimer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Métadonnées pour variant detailed */}
        {variant === 'detailed' && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>
                Ajouté le{' '}
                {new Date(initiative.created_at).toLocaleDateString('fr-FR')}
              </span>
              {initiative.updated_at !== initiative.created_at && (
                <span>
                  Modifié le{' '}
                  {new Date(initiative.updated_at).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
