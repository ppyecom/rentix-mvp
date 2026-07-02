import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Equipment, Booking } from '../lib/types';
import { soles, daysBetween } from '../lib/format';
import { Spinner, Pin } from '../components/ui';

export default function Checkout() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const start = params.get('start') || '';
  const end = params.get('end') || '';

  const [eq, setEq] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', name: '', exp: '12/28', cvv: '123' });

  useEffect(() => {
    api.get<{ equipment: Equipment }>(`/equipment/${id}`)
      .then((r) => setEq(r.equipment))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!eq) return <div className="p-20 text-center text-slate-400">Equipo no encontrado.</div>;

  const days = daysBetween(start, end);
  const subtotal = days * eq.price_per_day;
  const fee = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + fee;

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    // Simulated payment gateway delay
    await new Promise((r) => setTimeout(r, 1400));
    try {
      const r = await api.post<{ booking: Booking }>('/bookings', {
        equipment_id: eq!.id,
        start_date: start,
        end_date: end,
      });
      setDone(r.booking);
    } catch {
      setProcessing(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-neon-green/15 ring-1 ring-neon-green/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">¡Reserva confirmada!</h1>
        <p className="mt-2 text-slate-400">
          Tu alquiler de <span className="text-white">{eq.title}</span> está listo.
          Recibirás los detalles de coordinación por mensajes.
        </p>
        <div className="card mt-6 space-y-2 p-6 text-left text-sm">
          <Row label="Reserva #" value={`RTX-${String(done.id).padStart(5, '0')}`} />
          <Row label="Fechas" value={`${start} → ${end} (${done.days} días)`} />
          <Row label="Total pagado" value={soles(done.total)} highlight />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/dashboard" className="btn-primary">Ver mi dashboard</Link>
          <Link to="/marketplace" className="btn-ghost">Seguir explorando</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <h1 className="mb-1 text-3xl font-bold text-white">Checkout <span className="gradient-text">Seguro</span></h1>
      <p className="mb-8 text-sm text-slate-400">Pago protegido · Encriptación de extremo a extremo (simulado)</p>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Payment form */}
        <form onSubmit={pay} className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-white">Método de pago</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Número de tarjeta</label>
                <input className="input" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
              </div>
              <div>
                <label className="label">Nombre en la tarjeta</label>
                <input className="input" placeholder="Como aparece en la tarjeta" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Expiración</label>
                  <input className="input" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input className="input" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-500/5 px-3 py-2 text-xs text-slate-400 ring-1 ring-brand-500/15">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b8bff" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Pasarela de pagos simulada · No se realiza ningún cargo real.
            </div>
          </div>

          <div className="card flex items-start gap-4 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neon-green/15">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Depósito de garantía protegido</h3>
              <p className="mt-1 text-sm text-slate-400">Tu depósito se retiene de forma segura y se libera al devolver el equipo en buen estado.</p>
            </div>
          </div>

          <button className="btn-primary w-full py-3.5 text-base" disabled={processing || days < 1}>
            {processing ? 'Procesando pago...' : `Pagar ${soles(total)}`}
          </button>
        </form>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-6">
            <div className="flex gap-3">
              <img src={eq.image} alt={eq.title} className="h-20 w-20 rounded-xl object-cover ring-1 ring-white/10" />
              <div>
                <h3 className="font-semibold leading-tight text-white">{eq.title}</h3>
                <Pin city={eq.city} className="mt-1 text-xs" />
              </div>
            </div>
            <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-sm">
              <Row label="Fechas" value={`${days} día(s)`} />
              <Row label={`${soles(eq.price_per_day)} × ${days}`} value={soles(subtotal)} />
              <Row label="Tarifa de servicio (10%)" value={soles(fee)} />
              <Row label="Rentix Shield" value="Incluido" />
              <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="font-semibold text-white">Total</span>
                <span className="text-2xl font-black gradient-text">{soles(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? 'font-bold gradient-text' : 'text-slate-200'}>{value}</span>
    </div>
  );
}
