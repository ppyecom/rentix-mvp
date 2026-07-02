import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Equipment, Booking } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { soles } from '../lib/format';
import { Avatar, Stars, StatusBadge, Pin, Spinner, VerifiedTick } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earned, setEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'reservas' | 'equipos'>('reservas');

  useEffect(() => {
    Promise.all([
      api.get<{ equipment: Equipment[] }>('/equipment/mine/list'),
      api.get<{ bookings: Booking[] }>('/bookings/mine'),
      api.get<{ earned: number; rentals: number }>('/bookings/earnings'),
    ])
      .then(([e, b, earn]) => { setListings(e.equipment); setBookings(b.bookings); setEarned(earn.earned); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Cargando tu dashboard..." />;

  const spent = bookings.reduce((s, b) => s + b.total, 0);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      {/* Profile header */}
      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar src={user?.avatar} alt={user?.name || 'U'} size={72} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            {user?.verified && <VerifiedTick className="h-5 w-5" />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <Stars rating={user?.rating || 5} />
            <span>· {user?.reviews_count || 0} reseñas</span>
            <Pin city={user?.city || 'Lima, Perú'} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/publicar" className="btn-primary">+ Publicar equipo</Link>
          <Link to="/perfil/editar" className="btn-ghost">Editar perfil</Link>
          <Link to={`/perfil/${user?.id}`} className="btn-ghost">Ver perfil público</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Mis equipos" value={String(listings.length)} />
        <Stat label="Reservas" value={String(bookings.length)} />
        <Stat label="Gasto total (alquileres)" value={soles(spent)} />
        <Stat label="Ingresos (mis equipos)" value={soles(earned)} accent />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-white/[0.06]">
        <TabBtn active={tab === 'reservas'} onClick={() => setTab('reservas')}>Mis reservas</TabBtn>
        <TabBtn active={tab === 'equipos'} onClick={() => setTab('equipos')}>Mis equipos publicados</TabBtn>
      </div>

      {tab === 'reservas' ? (
        <div className="mt-6 space-y-3">
          {bookings.length === 0 ? (
            <Empty text="Aún no tienes reservas." cta="Explorar marketplace" to="/marketplace" />
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="card flex items-center gap-4 p-4">
                <img src={b.equipment_image} alt="" className="h-16 w-16 rounded-xl object-cover ring-1 ring-white/10" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{b.equipment_title}</p>
                  <p className="text-xs text-slate-400">{b.start_date} → {b.end_date} · {b.days} día(s)</p>
                </div>
                <div className="text-right">
                  <span className="chip bg-neon-green/15 text-neon-green ring-neon-green/30">{b.status}</span>
                  <p className="mt-1 font-bold gradient-text">{soles(b.total)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="mt-6">
          {listings.length === 0 ? (
            <Empty text="Aún no has publicado equipos." cta="Publicar mi primer equipo" to="/publicar" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((eq) => (
                <Link key={eq.id} to={`/equipo/${eq.id}`} className="card overflow-hidden transition hover:ring-brand-500/30">
                  <div className="relative">
                    <img src={eq.image} alt={eq.title} className="aspect-[4/3] w-full object-cover" />
                    <div className="absolute left-3 top-3"><StatusBadge status={eq.status} /></div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-white">{eq.title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold gradient-text">{soles(eq.price_per_day)}/día</span>
                      <Stars rating={eq.rating} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${accent ? 'gradient-text' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${
        active ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ text, cta, to }: { text: string; cta: string; to: string }) {
  return (
    <div className="card p-14 text-center">
      <p className="text-slate-400">{text}</p>
      <Link to={to} className="btn-primary mt-4">{cta}</Link>
    </div>
  );
}
