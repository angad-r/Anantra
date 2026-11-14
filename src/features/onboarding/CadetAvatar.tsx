import type { AvatarId } from '../../types/cadetProfile';
import { AVATAR_BY_ID } from './cadetProfileData';

interface CadetAvatarProps {
  avatarId?: AvatarId;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<CadetAvatarProps['size']>, string> = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

export function getAvatarLabel(avatarId?: AvatarId): string {
  if (!avatarId) return 'Default Cadet Crest';
  return AVATAR_BY_ID[avatarId]?.label ?? 'Default Cadet Crest';
}

export function CadetAvatar({
  avatarId,
  size = 'md',
  className = '',
}: CadetAvatarProps) {
  const label = getAvatarLabel(avatarId);

  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-sky-400/40 bg-space-slate shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${SIZE_CLASSES[size]} ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`bg-${avatarId ?? 'default'}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="65%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#050914" />
          </radialGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="31"
          fill={`url(#bg-${avatarId ?? 'default'})`}
        />
        <circle cx="15" cy="18" r="1" fill="#e2e8f0" opacity="0.7" />
        <circle cx="50" cy="16" r="1.2" fill="#67e8f9" opacity="0.8" />
        <circle cx="48" cy="48" r="1" fill="#e2e8f0" opacity="0.6" />

        {avatarId === 'orbit-helmet' && (
          <>
            <path d="M16 55 C19 44, 45 44, 48 55" fill="#cbd5e1" />
            <rect x="26" y="45" width="12" height="6" rx="2" fill="#38bdf8" />
            <circle cx="32" cy="30" r="15" fill="#f8fafc" />
            <ellipse cx="32" cy="30" rx="11" ry="8.5" fill="#f59e0b" />
            <path
              d="M24 27 C27 24, 34 24, 38 26"
              stroke="#fef3c7"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        {avatarId === 'lunar-rover' && (
          <>
            <path d="M10 47 Q32 41 54 47 L54 58 L10 58 Z" fill="#334155" />
            <rect x="21" y="29" width="22" height="10" rx="3" fill="#e2e8f0" />
            <rect x="25" y="18" width="10" height="7" rx="2" fill="#38bdf8" />
            <line x1="30" y1="25" x2="30" y2="29" stroke="#94a3b8" strokeWidth="2.5" />
            <circle cx="23" cy="43" r="4.5" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
            <circle cx="32" cy="43" r="4.5" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
            <circle cx="41" cy="43" r="4.5" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
            <circle cx="28" cy="21" r="1.5" fill="#e0f2fe" />
          </>
        )}

        {avatarId === 'star-commander' && (
          <>
            <polygon
              points="32,12 37.5,24 51,25.5 41,34.5 43.8,48 32,41.2 20.2,48 23,34.5 13,25.5 26.5,24"
              fill="#fbbf24"
              stroke="#fef3c7"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="31" r="5" fill="#0f172a" />
            <circle cx="32" cy="31" r="2.2" fill="#38bdf8" />
          </>
        )}

        {avatarId === 'nebula-explorer' && (
          <>
            <circle cx="32" cy="32" r="16" fill="#7c3aed" opacity="0.35" />
            <path
              d="M32 13 L39 29 L32 37 L25 29 Z"
              fill="#e2e8f0"
            />
            <path d="M25 29 L19 38 L27 36 Z" fill="#38bdf8" />
            <path d="M39 29 L45 38 L37 36 Z" fill="#38bdf8" />
            <circle cx="32" cy="25" r="3" fill="#0ea5e9" />
            <path d="M29 38 L32 50 L35 38 Z" fill="#fbbf24" />
          </>
        )}

        {avatarId === 'saturn-pilot' && (
          <>
            <circle cx="32" cy="32" r="11" fill="#fbbf24" />
            <path d="M22 29 Q32 25 42 29" stroke="#d97706" strokeWidth="2" fill="none" />
            <ellipse
              cx="32"
              cy="33"
              rx="22"
              ry="7"
              transform="rotate(-22 32 33)"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.2"
            />
          </>
        )}

        {avatarId === 'nova-bot' && (
          <>
            <line x1="32" y1="12" x2="32" y2="19" stroke="#67e8f9" strokeWidth="2.5" />
            <circle cx="32" cy="11" r="2.5" fill="#fbbf24" />
            <rect x="17" y="19" width="30" height="24" rx="7" fill="#e2e8f0" />
            <rect x="21" y="24" width="22" height="12" rx="4" fill="#0f172a" />
            <circle cx="27" cy="30" r="2.4" fill="#38bdf8" />
            <circle cx="37" cy="30" r="2.4" fill="#38bdf8" />
            <path d="M25 46 L39 46 L42 53 L22 53 Z" fill="#38bdf8" />
          </>
        )}

        {!avatarId && (
          <>
            <circle
              cx="32"
              cy="32"
              r="18"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <path d="M32 16 L40 34 L32 30 L24 34 Z" fill="#e0f2fe" />
            <circle cx="32" cy="40" r="3" fill="#38bdf8" />
          </>
        )}
      </svg>
    </span>
  );
}
