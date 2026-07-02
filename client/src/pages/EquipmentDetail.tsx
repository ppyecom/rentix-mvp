import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Equipment, Review } from '../lib/types';
import { soles, daysBetween } from '../lib/format';
import { Stars, Pin, Spinner, Avatar, VerifiedTick } from '../components/ui';
import { EquipmentCard } from '../components/EquipmentCard';
import { useAuth } from '../context/AuthContext';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [eq, setEq] = useState<Equipment | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similar, setSimilar] = useState<Equipment[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  // Formulario de reseñas
  const [rvRating, setRvRating] = useState(5);
  const [rvComment, setRvComment] = useState('');
  const [rvBusy, setRvBusy] = useState(false);
  const [rvError, setRvError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get<{ equipment: Equipment; reviews: Review[]; similar: Equipment[] }>(`/equipment/${id}`)
      .then((r) => { setEq(r.equipment); setReviews(r.reviews); setSimilar(r.similar); setActive(0); })
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <Spinner label="Cargando equipo..." />;
  if (!eq) return <div className="p-20 text-center text-slate-400">Equipo no encontrado.</div>;

  const days = daysBetween(start, end);
  const subtotal = days * eq.price_per_day;
  const fee = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + fee;
  const gallery = eq.gallery.length ? eq.gallery : [eq.image];

  function reserve() {
    if (!user) return navigate('/login', { state: { from: `/equipo/${id}` } });
    if (!end || days < 1) return;
    navigate(`/checkout/${eq!.id}?start=${start}&end=${end}`);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: `/equipo/${id}` } });
    if (!rvComment.trim()) return;
    setRvBusy(true);
    setRvError('');
    try {
      const r = await api.post<{ reviews: Review[]; rating: number; reviews_count: number }>(
        `/equipment/${id}/reviews`,
        { rating: rvRating, comment: rvComment }
      );
      setReviews(r.reviews);
      setEq((prev) => (prev ? { ...prev, rating: r.rating, reviews_count: r.reviews_count } : prev));
      setRvComment('');
      setRvRating(5);
    } catch (err: any) {
      setRvError(err.message);
    } finally {
      setRvBusy(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: `/equipo/${id}` } });
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { to_id: eq!.owner_id, equipment_id: eq!.id, body: msg });
      setMsg('');
      navigate('/mensajes');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: gallery + info */}
        <div>
          <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
            <img src={gallery[active]} alt={eq.title} className="aspect-[16/10] w-full object-cover" />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {gallery.slice(0, 4).map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-xl ring-1 transition ${
                  active === i ? 'ring-2 ring-brand-500' : 'ring-white/10 hover:ring-white/30'
                }`}
              >
                <img src={g} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-6">
            <span className="chip bg-ink-700/60 text-xs uppercase tracking-wider text-slate-400">
              {eq.category}
            </span>
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-white">{eq.title}</h1>
              <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-ink-800 px-3 py-2 ring-1 ring-white/10">
                <Stars rating={eq.rating} />
                <span className="text-xs text-slate-500">({eq.reviews_count})</span>
              </div>
            </div>
            <Pin city={eq.city} className="mt-2 text-sm" />
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">{eq.description}</p>
          </div>

          {/* Specs */}
          {eq.specs.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {eq.specs.map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
                  <p className="mt-1 text-xl font-black gradient-text">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Rentix Shield */}
          {eq.shield && (
            <div className="mt-6 flex items-start gap-4 rounded-2xl bg-gradient-to-r from-brand-500/10 to-violet-500/10 p-5 ring-1 ring-brand-500/20">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/20">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b8bff" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-white">Protegido por Rentix Shield</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Este alquiler está cubierto por un seguro de equipo profesional. Incluye
                  responsabilidad civil y protección contra daños sin costo adicional para ti.
                </p>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-white">Reseñas ({reviews.length})</h2>

            {/* Formulario para dejar una reseña */}
            <form onSubmit={submitReview} className="card mb-5 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300">Tu calificación:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRvRating(n)}
                      className={`text-xl transition ${n <= rvRating ? 'text-neon-cyan' : 'text-ink-500'}`}
                      aria-label={`${n} estrellas`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              {rvError && <p className="mb-2 text-sm text-rose-400">{rvError}</p>}
              <textarea
                value={rvComment}
                onChange={(e) => setRvComment(e.target.value)}
                placeholder={user ? 'Comparte tu experiencia con este equipo...' : 'Inicia sesión para dejar una reseña'}
                rows={2}
                className="input resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button className="btn-primary" disabled={rvBusy || !rvComment.trim()}>
                  {rvBusy ? 'Enviando...' : 'Publicar reseña'}
                </button>
              </div>
            </form>

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no hay reseñas para este equipo.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar src={r.author_avatar} alt={r.author_name} size={36} />
                        <span className="font-semibold text-white">{r.author_name}</span>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: booking sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-6">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-white">{soles(eq.price_per_day)}</p>
              <span className="text-sm text-slate-400">/ día</span>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="label">Fecha de inicio</label>
                <input type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Fecha de fin</label>
                <input type="date" min={start} value={end} onChange={(e) => setEnd(e.target.value)} className="input" />
              </div>
            </div>

            {days > 0 && (
              <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
                <Row label={`${soles(eq.price_per_day)} × ${days} día(s)`} value={soles(subtotal)} />
                <Row label="Tarifa de servicio (10%)" value={soles(fee)} />
                <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-xl font-black gradient-text">{soles(total)}</span>
                </div>
              </div>
            )}

            <button
              onClick={reserve}
              disabled={eq.status !== 'disponible' || days < 1}
              className="btn-primary mt-5 w-full"
            >
              {eq.status !== 'disponible' ? 'No disponible' : days < 1 ? 'Elige tus fechas' : 'Reservar ahora'}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">Aún no se te cobrará nada</p>
          </div>

          {/* Owner card */}
          <div className="card mt-4 p-5">
            <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">Arrendador</p>
            <Link to={`/perfil/${eq.owner_id}`} className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-white/5">
              <Avatar src={eq.owner_avatar} alt={eq.owner_name || 'Owner'} size={48} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white hover:underline">{eq.owner_name}</span>
                  {eq.owner_verified ? <VerifiedTick /> : null}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Stars rating={eq.owner_rating || 5} /> · {eq.owner_reviews} reseñas
                </div>
              </div>
            </Link>
            <form onSubmit={sendMessage} className="mt-4">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={`Pregunta a ${eq.owner_name?.split(' ')[0]} sobre el equipo...`}
                rows={2}
                className="input resize-none"
              />
              <button className="btn-ghost mt-2 w-full" disabled={sending}>
                {sending ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <div className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Equipo de Alta Gama Similar</h2>
            <Link to={`/marketplace?category=${encodeURIComponent(eq.category)}`} className="text-sm font-semibold text-brand-400 hover:underline">Ver todo →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => <EquipmentCard key={s.id} eq={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-slate-400">
      <span>{label}</span>
      <span className="text-slate-200">{value}</span>
    </div>
  );
}
