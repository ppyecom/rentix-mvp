import { Link } from 'react-router-dom';
import type { Equipment } from '../lib/types';
import { soles } from '../lib/format';
import { Stars, StatusBadge, Pin } from './ui';

export function EquipmentCard({ eq }: { eq: Equipment }) {
  return (
    <Link
      to={`/equipo/${eq.id}`}
      className="card group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glow hover:ring-brand-500/30"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={eq.image}
          alt={eq.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <StatusBadge status={eq.status} />
        </div>
        <button
          type="button"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-ink-900/70 text-slate-300 ring-1 ring-white/10 backdrop-blur transition hover:text-rose-400"
          onClick={(e) => e.preventDefault()}
          aria-label="Guardar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-white line-clamp-2">{eq.title}</h3>
          <Stars rating={eq.rating} className="shrink-0" />
        </div>
        <Pin city={eq.city} className="text-xs" />
        <div className="mt-3 flex items-end justify-between">
          <p className="text-lg font-bold text-white">
            <span className="gradient-text">{soles(eq.price_per_day)}</span>
            <span className="ml-1 text-xs font-normal text-slate-400">/ día</span>
          </p>
          <span className="chip bg-ink-700/60 text-slate-300">{eq.category}</span>
        </div>
      </div>
    </Link>
  );
}
