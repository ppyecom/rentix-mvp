import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Equipment } from '../lib/types';
import { EquipmentCard } from '../components/EquipmentCard';
import { Section, Spinner } from '../components/ui';

const stats = [
  { value: '50k+', label: 'Equipos alquilados' },
  { value: '10k+', label: 'Usuarios verificados' },
  { value: '99.9%', label: 'Reservas exitosas' },
  { value: '24h', label: 'Soporte y delivery' },
];

const categories = [
  { name: 'Computación', icon: '💻' },
  { name: 'Cine', icon: '🎥' },
  { name: 'Audio', icon: '🎧' },
  { name: 'Inmersivo', icon: '🕶️' },
  { name: 'Gaming', icon: '🎮' },
  { name: 'Iluminación', icon: '💡' },
];

const steps = [
  { n: '01', title: 'Elige tu equipo', text: 'Explora el catálogo, compara precios y revisa la reputación del arrendador.' },
  { n: '02', title: 'Reserva seguro', text: 'Selecciona fechas, paga por la pasarela y activa el Rentix Shield.' },
  { n: '03', title: 'Produce tu magia', text: 'Recibe el equipo con delivery opcional y crea sin límites.' },
];

const testimonials = [
  { name: 'Sofía R.', role: 'Creadora de contenido', text: 'Alquilé una RED Komodo por un fin de semana. El proceso fue instantáneo y seguro.' },
  { name: 'Diego M.', role: 'Streamer', text: 'Monetizo mi PC gamer cuando no lo uso. Rentix me da ingresos extra sin riesgos.' },
  { name: 'Marcus V.', role: 'Arrendador Pro', text: 'El sistema de contratos y depósitos me protege en cada alquiler. Impecable.' },
];

export default function Landing() {
  const [featured, setFeatured] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get<{ equipment: Equipment[] }>('/equipment?sort=rating')
      .then((r) => setFeatured(r.equipment.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-5 pt-20 pb-10 text-center">
          <span className="chip mx-auto mb-6 bg-brand-500/10 text-brand-400 ring-brand-500/20">
            ⚡ Hardware-as-a-Service · Perú
          </span>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
            Accede a <span className="gradient-text">tecnología</span>
            <br /> sin comprarla
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-400 sm:text-lg">
            Alquila cámaras, laptops, drones y equipo profesional de forma rápida, segura y
            económica. La economía colaborativa del hardware.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate(`/marketplace?q=${encodeURIComponent(q)}`); }}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-ink-850/90 p-2 ring-1 ring-white/10 shadow-card"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="¿Qué equipo necesitas hoy?"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <button className="btn-primary">Buscar</button>
          </form>

          <div className="relative mx-auto mt-14 max-w-3xl">
            <div className="absolute inset-x-10 top-8 h-40 rounded-full bg-brand-500/20 blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80"
              alt="Equipo tecnológico premium"
              className="relative z-10 mx-auto w-full rounded-3xl object-cover ring-1 ring-white/10 shadow-glow animate-float"
              style={{ maxHeight: 340 }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-4 px-5 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black gradient-text">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <Section title="Explora por" highlight="Categorías">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/marketplace?category=${encodeURIComponent(c.name)}`}
              className="card flex flex-col items-center gap-2 p-5 transition hover:-translate-y-1 hover:ring-brand-500/30"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-xs font-medium text-slate-300">{c.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Featured */}
      <Section
        title="Equipamiento"
        highlight="Premium"
        action={<Link to="/marketplace" className="text-sm font-semibold text-brand-400 hover:underline">Ver todo →</Link>}
      >
        {loading ? (
          <Spinner label="Cargando equipos..." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((eq) => (
              <EquipmentCard key={eq.id} eq={eq} />
            ))}
          </div>
        )}
      </Section>

      {/* 3 steps */}
      <Section title="Tecnología en" highlight="3 pasos">
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card p-6">
              <p className="text-4xl font-black text-ink-600">{s.n}</p>
              <h3 className="mt-3 text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section title="Lo que dicen los" highlight="Creadores">
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="mb-3 flex text-neon-cyan">
                {'★★★★★'.split('').map((_, i) => <span key={i}>★</span>)}
              </div>
              <p className="text-sm text-slate-300">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <img src={`https://i.pravatar.cc/80?u=${t.name}`} alt={t.name} className="h-9 w-9 rounded-full ring-2 ring-white/10" />
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-4">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 text-center shadow-glow-violet">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            ¿Tienes equipos sin uso? Monetízalos hoy.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-white/80">
            Publica tu equipo en minutos y empieza a generar ingresos con la comunidad Rentix.
          </p>
          <Link to="/publicar" className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-ink-900 transition hover:brightness-95">
            Publicar mi equipo
          </Link>
        </div>
      </section>
    </div>
  );
}
