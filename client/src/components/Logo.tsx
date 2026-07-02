import { Link } from 'react-router-dom';

/**
 * Rentix logo: network/globe "R" mark + wordmark.
 * Recreated as SVG from the brand mark (blue → green gradient).
 * To use the exact raster logo, drop it at client/public/logo.png
 * and the <img> fallback below will pick it up.
 */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lmb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b8bff" />
          <stop offset="1" stopColor="#1d54e8" />
        </linearGradient>
        <linearGradient id="lmg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#4ade80" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <path d="M14 8h20a14 14 0 0 1 0 28h-6l14 20h-12L18 38v18h-4z" fill="url(#lmb)" />
      <path d="M20 40l16 16h-9L18 42z" fill="url(#lmg)" />
      <circle cx="10" cy="14" r="3" fill="#22d3ee" />
      <circle cx="8" cy="30" r="2.5" fill="#5b8bff" />
      <circle cx="14" cy="46" r="2.5" fill="#4ade80" />
      <path
        d="M10 14L20 20M8 30L18 26M14 46L22 40"
        stroke="#2f6bff"
        strokeWidth="1.5"
        opacity="0.6"
      />
    </svg>
  );
}

export function Logo({ size = 30, className = '' }: { size?: number; className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span
        className="font-extrabold tracking-tight gradient-text"
        style={{ fontSize: size * 0.72 }}
      >
        Rentix
      </span>
    </Link>
  );
}
