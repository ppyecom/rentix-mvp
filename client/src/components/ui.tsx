import { ReactNode } from 'react';

export function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-neon-cyan ${className}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z" />
      </svg>
      <span className="font-semibold text-slate-200">{rating.toFixed(1)}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const disponible = status === 'disponible';
  return (
    <span
      className={`chip ${
        disponible
          ? 'bg-neon-green/15 text-neon-green ring-neon-green/30'
          : 'bg-amber-500/15 text-amber-400 ring-amber-500/30'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${disponible ? 'bg-neon-green' : 'bg-amber-400'}`}
      />
      {disponible ? 'DISPONIBLE' : 'ALQUILADO'}
    </span>
  );
}

export function Pin({ city, className = '' }: { city: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-slate-400 ${className}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {city}
    </span>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-500" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function Avatar({ src, alt, size = 40 }: { src?: string; alt: string; size?: number }) {
  return (
    <img
      src={src || `https://i.pravatar.cc/150?u=${encodeURIComponent(alt)}`}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover ring-2 ring-white/10"
      style={{ width: size, height: size }}
    />
  );
}

export function VerifiedTick({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="#2f6bff" aria-label="Verificado">
      <path d="M12 2l2.4 1.8 3 .1 1 2.8 2.4 1.7-.9 2.9.9 2.9-2.4 1.7-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.2 15.6l.9-2.9-.9-2.9 2.4-1.7 1-2.8 3-.1z" />
      <path d="M9.5 12.5l1.8 1.8 3.4-3.6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Section({
  title,
  highlight,
  action,
  children,
}: {
  title: string;
  highlight?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12">
      <div className="mb-7 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {title} {highlight && <span className="gradient-text">{highlight}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
