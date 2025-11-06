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
  Navigation,
  Share2,
  Recycle,
  RefreshCw,
  Wrench,
  Bike,
  Trash2,
  Leaf,
  Wheat,
  Flower2,
  Sprout,
  Shirt,
  Gift,
  ShoppingCart,
  ShoppingBag,
  LibraryBig,
  Handshake,
  Users,
  Cpu,
  Building2,
  Coffee,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Info,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import {
  TYPE_GRADIENTS,
  INITIATIVE_ICONS,
  TYPE_MARKER_COLORS,
  INITIATIVE_DESCRIPTIONS,
} from '@/types/initiative';

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
 * Icon component mapping from string to Lucide React component
 */
const ICON_COMPONENTS = {
  Recycle,
  RefreshCw,
  Wrench,
  Bike,
  Trash2,
  Leaf,
  Wheat,
  Flower2,
  Sprout,
  Shirt,
  Gift,
  ShoppingCart,
  ShoppingBag,
  LibraryBig,
  Handshake,
  Users,
  Cpu,
  Building2,
  Coffee,
  MapPin,
} as const;

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
 * Image placeholder with initiative type icon
 */
function ImagePlaceholder({ type }: { type: Initiative['type'] }) {
  const iconName = INITIATIVE_ICONS[type];
  const IconComponent =
    ICON_COMPONENTS[iconName as keyof typeof ICON_COMPONENTS];
  const gradient = TYPE_GRADIENTS[type];

  return (
    <div
      className={`relative h-48 w-full flex items-center justify-center bg-gradient-to-br ${gradient}`}
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      {/* Icon */}
      {IconComponent && (
        <IconComponent className="w-24 h-24 text-white/90 relative z-10" />
      )}
    </div>
  );
}

/**
 * Initiative type badge with subtle styling
 * Includes tooltip with info icon that appears only on hover (pure CSS)
 */
function TypeBadge({
  type,
  onDarkBackground = false,
}: {
  type: Initiative['type'];
  onDarkBackground?: boolean;
}) {
  const color = TYPE_MARKER_COLORS[type];
  const description = INITIATIVE_DESCRIPTIONS[type];

  // Clean minimal badge
  const badgeClasses =
    'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all';

  const badgeStyle = onDarkBackground
    ? {
        background: 'rgba(15, 23, 42, 0.85)',
        color: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }
    : {
        background: 'rgb(248, 250, 252)',
        border: '1px solid rgb(226, 232, 240)',
        color: 'rgb(51, 65, 85)',
      };

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipHeight = 100; // Approximate height
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    // Position below if not enough space above
    const shouldPositionBelow =
      spaceAbove < tooltipHeight && spaceBelow > spaceAbove;

    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: shouldPositionBelow ? rect.bottom + 10 : rect.top - 10,
    });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const tooltipContent =
    mounted && showTooltip
      ? createPortal(
          <div
            className="px-3 py-2 rounded-lg text-xs leading-relaxed text-white bg-gradient-to-br from-slate-900 to-slate-800 border border-white/20 shadow-2xl transition-all duration-200 pointer-events-none whitespace-normal"
            style={{
              position: 'fixed',
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform:
                tooltipPosition.y < 150
                  ? 'translate(-50%, 0%)'
                  : 'translate(-50%, -100%)',
              width: '16rem',
              maxWidth: '16rem',
              zIndex: 100000,
              opacity: 1,
              visibility: 'visible',
            }}
          >
            {description}
            <div
              className="absolute left-1/2 -translate-x-1/2 border-4 border-transparent"
              style={
                tooltipPosition.y < 150
                  ? {
                      top: '-8px',
                      borderBottom: '4px solid rgb(15, 23, 42)',
                      borderTop: 'none',
                    }
                  : {
                      bottom: '-8px',
                      borderTop: '4px solid rgb(15, 23, 42)',
                      borderBottom: 'none',
                    }
              }
            />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className={badgeClasses} style={badgeStyle}>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }}
        />
        <span className="font-normal">{type}</span>
        <button
          type="button"
          className="p-0.5 rounded-full hover:bg-white/30 transition-all cursor-pointer"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label={`Information sur ${type}`}
          style={{ color: 'rgba(100, 116, 139, 0.7)' }}
        >
          <Info className="h-3 w-3" />
        </button>
      </div>
      {tooltipContent}
    </>
  );
}

/**
 * Verification badge with subtle styling
 */
function VerifiedBadge({
  verified,
  onDarkBackground = false,
}: {
  verified: boolean;
  onDarkBackground?: boolean;
}) {
  if (!verified) return null;

  if (onDarkBackground) {
    // Badge on dark background
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
        style={{
          background: 'rgba(34, 197, 94, 0.2)',
          color: 'rgb(34, 197, 94)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}
        title="Initiative vérifiée par l'équipe LaMap"
      >
        <Check className="h-3 w-3" />
        <span className="font-normal">Vérifiée</span>
      </div>
    );
  }

  // Badge on light background
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: 'rgb(240, 253, 244)',
        border: '1px solid rgb(187, 247, 208)',
        color: 'rgb(22, 101, 52)',
      }}
      title="Initiative vérifiée par l'équipe LaMap"
    >
      <Check className="h-3 w-3" />
      <span className="font-normal">Vérifiée</span>
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
          onClick={(e) => e.stopPropagation()}
        >
          <Phone size={16} className="text-emerald-400" />
        </a>
      )}

      {initiative.email && (
        <a
          href={`mailto:${initiative.email}`}
          className="p-2 glass rounded-lg hover:glass-strong transition-all duration-300 hover:scale-110"
          title="Envoyer un email"
          onClick={(e) => e.stopPropagation()}
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
          onClick={(e) => e.stopPropagation()}
        >
          <Globe size={16} className="text-white/80" />
          <ExternalLink size={12} className="text-white/60" />
        </a>
      )}
    </div>
  );
}

/**
 * Distance badge with prominent display
 */
function DistanceBadge({
  distance,
  onDarkBackground = false,
}: {
  distance: number;
  onDarkBackground?: boolean;
}) {
  if (onDarkBackground) {
    // Badge sur image sombre : texte blanc avec fond semi-transparent
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg border border-white/20 backdrop-blur-sm"
        style={{
          background: 'rgba(59, 130, 246, 0.6)',
        }}
        title={`À ${formatDistance(distance)} de votre position`}
      >
        <Navigation size={14} className="rotate-45" />
        <span>{formatDistance(distance)}</span>
      </div>
    );
  }

  // Badge sur fond clair : texte coloré avec fond transparent
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border backdrop-blur-sm"
      style={{
        background: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        color: '#2563eb',
      }}
      title={`À ${formatDistance(distance)} de votre position`}
    >
      <Navigation size={14} className="rotate-45" />
      <span>{formatDistance(distance)}</span>
    </div>
  );
}

/**
 * Share button with copy link functionality
 */
function ShareButton({ initiative }: { initiative: Initiative }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const url = `${window.location.origin}?initiative=${initiative.id}`;

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: initiative.name,
          text: `Découvrez ${initiative.name} sur LaMap`,
          url,
        });
        return;
      } catch (_err) {
        // User cancelled or share failed, fall back to clipboard
      }
    }

    // Fall back to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      style={{
        background: copied ? 'rgb(240, 253, 244)' : 'rgb(248, 250, 252)',
        border: `1px solid ${copied ? 'rgb(187, 247, 208)' : 'rgb(226, 232, 240)'}`,
        color: copied ? 'rgb(22, 101, 52)' : 'rgb(71, 85, 105)',
      }}
      title={copied ? 'Lien copié !' : 'Partager cette initiative'}
    >
      <Share2 size={16} />
      <span>{copied ? 'Copié' : 'Partager'}</span>
    </button>
  );
}

/**
 * Directions button - clean black button
 */
function DirectionsButton({ initiative }: { initiative: Initiative }) {
  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();

    const [lng, lat] = initiative.location.coordinates;
    const destination = encodeURIComponent(
      initiative.address || `${lat},${lng}`
    );

    // Open Google Maps with directions
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <button
      onClick={handleDirections}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
      style={{
        background: 'rgb(15, 23, 42)',
        border: '1px solid rgb(51, 65, 85)',
        color: 'white',
      }}
      title="Obtenir l'itinéraire dans Google Maps"
    >
      <Navigation size={16} />
      <span>Itinéraire</span>
    </button>
  );
}

// ================================
// MAIN COMPONENTS
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

  // Neo-minimalist design - clean white with subtle shadows
  const variantClasses = {
    card: 'rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden bg-white',
    popup:
      'rounded-xl border border-slate-200 max-w-sm overflow-hidden bg-white',
    list: 'rounded-lg border border-slate-100 transition-all duration-300 hover:shadow-md cursor-pointer overflow-hidden bg-white',
    detailed: 'rounded-xl border border-slate-200 overflow-hidden bg-white',
  };

  // Clean shadows - subtle and readable
  const shadowStyles = {
    card: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    },
    popup: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    list: {
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    detailed: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
                {distance && <DistanceBadge distance={distance} />}
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
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <QuickContact initiative={initiative} />
              <DirectionsButton initiative={initiative} />
            </div>
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
        {/* Image with gradient overlay or placeholder */}
        {initiative.image_url && !imageError ? (
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
              <TypeBadge type={initiative.type} onDarkBackground />
              <VerifiedBadge verified={initiative.verified} onDarkBackground />
              {distance && (
                <DistanceBadge distance={distance} onDarkBackground />
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <ImagePlaceholder type={initiative.type} />
            {/* Badges positioned on placeholder */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <TypeBadge type={initiative.type} />
              <VerifiedBadge verified={initiative.verified} />
              {distance && <DistanceBadge distance={distance} />}
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Badges if no image */}
          {!initiative.image_url && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <TypeBadge type={initiative.type} />
              <VerifiedBadge verified={initiative.verified} />
              {distance && <DistanceBadge distance={distance} />}
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

          {description && (
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {truncatedDescription}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <DirectionsButton initiative={initiative} />
            <ShareButton initiative={initiative} />
          </div>

          <div className="mt-3">
            <QuickContact initiative={initiative} />
          </div>
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
      {/* Header image with glassmorphism overlay or placeholder */}
      {initiative.image_url && !imageError ? (
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
            <TypeBadge type={initiative.type} onDarkBackground />
            <VerifiedBadge verified={initiative.verified} onDarkBackground />
            {distance && <DistanceBadge distance={distance} onDarkBackground />}
          </div>
        </div>
      ) : (
        <div className="relative">
          <ImagePlaceholder type={initiative.type} />
          {/* Badges positioned on placeholder */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <TypeBadge type={initiative.type} onDarkBackground />
            <VerifiedBadge verified={initiative.verified} onDarkBackground />
            {distance && <DistanceBadge distance={distance} onDarkBackground />}
          </div>
        </div>
      )}

      {/* Main content - clean and readable */}
      <div className="p-5 space-y-4">
        {/* Title - clear hierarchy */}
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
          {initiative.name}
        </h2>

        {/* Address - clean container */}
        {initiative.address && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-lg"
            style={{
              background: 'rgb(248, 250, 252)',
              border: '1px solid rgb(226, 232, 240)',
            }}
          >
            <MapPin size={16} className="flex-shrink-0 mt-0.5 text-slate-500" />
            <p className="text-sm leading-relaxed text-slate-700">
              {initiative.address}
            </p>
          </div>
        )}

        {/* Description - readable sizing */}
        {description && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 leading-relaxed">
              {truncatedDescription}
            </p>
            {description.length > 120 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {showFullDescription ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )}

        {/* Action buttons - Directions and Share */}
        <div className="flex flex-wrap items-center gap-2">
          <DirectionsButton initiative={initiative} />
          <ShareButton initiative={initiative} />
        </div>

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
                  className="text-xs px-2.5 py-1 rounded-full font-bold animate-pulse-subtle border backdrop-blur-sm"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    color: '#059669',
                  }}
                >
                  • Ouvert maintenant
                </span>
              ) : (
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-bold border backdrop-blur-sm"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#dc2626',
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

        {/* Social Media - clean with official colors */}
        {initiative.social_media &&
          Object.values(initiative.social_media).some(Boolean) && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-900">
                Réseaux sociaux
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {initiative.social_media.facebook && (
                  <a
                    href={initiative.social_media.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{
                      background: '#1877F2',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    title="Facebook"
                  >
                    <Facebook size={14} />
                    <span>Facebook</span>
                  </a>
                )}

                {initiative.social_media.instagram && (
                  <a
                    href={initiative.social_media.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{
                      background:
                        'linear-gradient(135deg, #833AB4 0%, #E4405F 50%, #F77737 100%)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    title="Instagram"
                  >
                    <Instagram size={14} />
                    <span>Instagram</span>
                  </a>
                )}

                {initiative.social_media.twitter && (
                  <a
                    href={initiative.social_media.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{
                      background: '#000000',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    title="X (Twitter)"
                  >
                    <Twitter size={14} />
                    <span>X</span>
                  </a>
                )}

                {initiative.social_media.linkedin && (
                  <a
                    href={initiative.social_media.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{
                      background: '#0A66C2',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    title="LinkedIn"
                  >
                    <Linkedin size={14} />
                    <span>LinkedIn</span>
                  </a>
                )}

                {initiative.social_media.youtube && (
                  <a
                    href={initiative.social_media.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{
                      background: '#FF0000',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    title="YouTube"
                  >
                    <Youtube size={14} />
                    <span>YouTube</span>
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
