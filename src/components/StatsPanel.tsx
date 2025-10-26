'use client';

/**
 * Statistics Panel Component
 *
 * Displays initiative statistics with modern glassmorphism design
 * Features: Real-time counts, type distribution, animated counters
 */

import { TrendingUp, MapPin, CheckCircle, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';

import type { Initiative, InitiativeType } from '@/types/initiative';

// ================================
// TYPES
// ================================

interface StatsPanelProps {
  /** List of initiatives to analyze */
  initiatives: Initiative[];

  /** Selected types for filtering stats */
  selectedTypes?: InitiativeType[];

  /** Show detailed breakdown */
  detailed?: boolean;
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

// ================================
// COMPONENTS
// ================================

/**
 * Animated counter with easing
 */
function AnimatedCounter({ value, duration = 1000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count.toLocaleString('fr-FR')}</span>;
}

/**
 * Stat card with glassmorphism effect
 */
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  gradient,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: number;
  subtitle?: string;
  gradient: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:scale-105"
      style={{
        background: gradient,
      }}
    >
      {/* Glassmorphism card */}
      <div className="relative h-full rounded-2xl bg-white/10 backdrop-blur-xl p-4 transition-all duration-300 group-hover:bg-white/20">
        {/* Animated background blob */}
        <div
          className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-all duration-500 group-hover:scale-150"
          style={{
            background: gradient,
          }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-3xl font-bold text-white mb-1">
              <AnimatedCounter value={value} />
            </p>
            {subtitle && (
              <p className="text-sm font-medium text-white/90">{subtitle}</p>
            )}
          </div>

          <div
            className="rounded-xl p-2 transition-transform duration-300 group-hover:scale-110"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// MAIN COMPONENT
// ================================

export default function StatsPanel({
  initiatives,
  selectedTypes = [],
  detailed = false,
}: StatsPanelProps) {
  // Calculate statistics
  const totalInitiatives = initiatives.length;
  const verifiedCount = initiatives.filter((i) => i.verified).length;
  const selectedCount =
    selectedTypes.length > 0
      ? initiatives.filter((i) => selectedTypes.includes(i.type)).length
      : totalInitiatives;

  // Count by type
  const typeCounts = initiatives.reduce((acc, initiative) => {
    acc[initiative.type] = (acc[initiative.type] || 0) + 1;
    return acc;
  }, {} as Record<InitiativeType, number>);

  // Get top 3 types
  const topTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Main stats grid with glassmorphism */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={MapPin}
          label="Total"
          value={totalInitiatives}
          subtitle="initiatives à proximité"
          gradient="linear-gradient(135deg, #64748b 0%, #475569 100%)"
        />

        <StatCard
          icon={CheckCircle}
          label="Vérifiées"
          value={verifiedCount}
          subtitle={`${Math.round(
            (verifiedCount / totalInitiatives) * 100
          )}% du total`}
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
        />
      </div>

      {selectedTypes.length > 0 && (
        <StatCard
          icon={Activity}
          label="Filtrées"
          value={selectedCount}
          subtitle={`${selectedTypes.length} type${
            selectedTypes.length > 1 ? 's' : ''
          } sélectionné${selectedTypes.length > 1 ? 's' : ''}`}
          gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
        />
      )}

      {/* Top types with liquid glass effect */}
      {detailed && topTypes.length > 0 && (
        <Card className="relative overflow-hidden rounded-2xl border-none bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl p-4">
          {/* Animated gradient background - more neutral */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 via-blue-500/10 to-indigo-500/10 animate-gradient" />{' '}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-white/70" />
              <h3 className="text-sm font-semibold text-white/90">
                Types populaires
              </h3>
            </div>

            <div className="space-y-2">
              {topTypes.map(([type, count], index) => {
                const percentage = Math.round((count / totalInitiatives) * 100);
                const colors = [
                  'from-blue-500 to-indigo-500', // First most popular - blue
                  'from-emerald-500 to-green-500', // Second - green
                  'from-purple-500 to-violet-500', // Third - purple
                ];

                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/80 font-medium">{type}</span>
                      <span className="text-white/60">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-1000 ease-out`}
                        style={{
                          width: `${percentage}%`,
                          animation: 'slideIn 1s ease-out',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            width: 0%;
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
