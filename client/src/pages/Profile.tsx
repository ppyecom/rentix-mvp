import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { User } from '../lib/types';
import { soles } from '../lib/format';
import { Avatar, Stars, Pin, Spinner, StatusBadge, VerifiedTick } from '../components/ui';

interface Listing {
  id: number;
  title: string;
  image: string;
  price_per_day: number;
  city: string;
  rating: number;
  status: string;
}

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ user: User; listings: Listing[] }>(`/users/${id}`)
      .then((r) => { setUser(r.user); setListings(r.listings); })
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <Spinner label="Cargando perfil..." />;
  if (!user) return <div className="p-20 text-center text-slate-400">Usuario no encontrado.</div>;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      {/* Cabecera del perfil */}
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-brand-gradient opacity-20" />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-end">
          <Avatar src={user.avatar} alt={user.name} size={96} />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              {user.verified && <VerifiedTick className="h-5 w-5" />}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400 sm:justify-start">
              <Stars rating={user.rating || 5} />
              <span>· {user.reviews_count || 0} reseñas</span>
              <Pin city={user.city || 'Lima, Perú'} />
            </div>
            {user.bio && <p className="mt-3 max-w-2xl text-sm text-slate-300">{user.bio}</p>}
          </div>
        </div>
      </div>

      {/* Insignias de confianza */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Badge icon="🛡️" label="Identidad verificada" active={!!user.verified} />
        <Badge icon="⭐" label={`${(user.rating || 5).toFixed(1)} de calificación`} active />
        <Badge icon="📦" label={`${listings.length} equipos`} active />
        <Badge icon="✅" label="Miembro Rentix" active />
      </div>

      {/* Equipos publicados */}
      <h2 className="mb-4 mt-10 text-xl font-bold text-white">
        Equipos de {user.name.split(' ')[0]}
      </h2>
      {listings.length === 0 ? (
        <p className="card p-10 text-center text-slate-400">Este usuario aún no publica equipos.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((l) => (
            <Link key={l.id} to={`/equipo/${l.id}`} className="card overflow-hidden transition hover:-translate-y-1 hover:ring-brand-500/30">
              <div className="relative">
                <img src={l.image} alt={l.title} className="aspect-[4/3] w-full object-cover" />
                <div className="absolute left-3 top-3"><StatusBadge status={l.status} /></div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-white line-clamp-1">{l.title}</p>
                <Pin city={l.city} className="mt-1 text-xs" />
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-bold gradient-text">{soles(l.price_per_day)}/día</span>
                  <Stars rating={l.rating} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ icon, label, active }: { icon: string; label: string; active: boolean }) {
  return (
    <div className={`card flex items-center gap-3 p-4 ${active ? '' : 'opacity-40'}`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-slate-200">{label}</span>
    </div>
  );
}
