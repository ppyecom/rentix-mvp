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
  const [operation, setOperation] = useState('');
  const [copied, setCopied] = useState(false);

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
  const hasYape = !!eq.owner_yape_number;

  function copyYape() {
    navigator.clipboard?.writeText(eq!.owner_yape_number || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    try {
      // 1. Crea la reserva (queda pendiente de pago)
      const r = await api.post<{ booking: Booking }>('/bookings', {
        equipment_id: eq!.id,
        start_date: start,
        end_date: end,
      });
      // 2. Reporta el pago con el número de operación de Yape
      const paid = await api.post<{ booking: Booking }>(`/bookings/${r.booking.id}/pay`, {
        yape_operation: operation,
      });
      setDone({ ...r.booking, ...paid.booking });
    } catch {
      setProcessing(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-neon-cyan/15 ring-1 ring-neon-cyan/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">¡Pago reportado!</h1>
        <p className="mt-2 text-slate-400">
          Le avisamos a <span className="text-white">{eq.owner_name}</span> que ya pagaste.
          En cuanto <span className="text-white">confirme la recepción</span> en su Yape, tu
          reserva de <span className="text-white">{eq.title}</span> quedará confirmada.
        </p>
        <div className="card mt-6 space-y-2 p-6 text-left text-sm">
          <Row label="Reserva #" value={`RTX-${String(done.id).padStart(5, '0')}`} />
          <Row label="Fechas" value={`${start} → ${end} (${done.days} días)`} />
          {operation && <Row label="N° operación Yape" value={operation} />}
          <Row label="Total" value={soles(done.total)} highlight />
          <Row label="Estado" value="Esperando confirmación del arrendador" />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/dashboard" className="btn-primary">Ver mi dashboard</Link>
          <Link to={`/equipo/${eq.id}`} className="btn-ghost">Volver al equipo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <h1 className="mb-1 text-3xl font-bold text-white">Pago <span className="gradient-text">Seguro</span></h1>
      <p className="mb-8 text-sm text-slate-400">Paga con Yape directo al arrendador · Rentix registra la operación</p>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={pay} className="space-y-6">
          {hasYape ? (
            <>
              {/* Tarjeta Yape */}
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-brand-600 p-6 text-white shadow-glow-violet">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black tracking-tight">Yape</span>
                  <span className="text-xs opacity-80">Pago P2P</span>
                </div>
                <p className="mt-6 text-xs uppercase tracking-wide opacity-80">Yapea a</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-3xl font-black tracking-wider">{eq.owner_yape_number}</span>
                  <button type="button" onClick={copyYape} className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold hover:bg-white/30">
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="mt-1 text-sm opacity-90">{eq.owner_yape_name || eq.owner_name}</p>
                <div className="mt-5 flex items-end justify-between border-t border-white/20 pt-4">
                  <span className="text-sm opacity-80">Monto a pagar</span>
                  <span className="text-2xl font-black">{soles(total)}</span>
                </div>
              </div>

              {/* Pasos */}
              <div className="card p-6">
                <h2 className="mb-4 text-lg font-bold text-white">Cómo pagar</h2>
                <ol className="space-y-3 text-sm text-slate-300">
                  <Step n={1}>Abre tu app <b className="text-white">Yape</b> y elige "Yapear".</Step>
                  <Step n={2}>Ingresa el número <b className="text-white">{eq.owner_yape_number}</b> y el monto <b className="text-white">{soles(total)}</b>.</Step>
                  <Step n={3}>Copia el <b className="text-white">número de operación</b> que te da Yape y pégalo aquí abajo.</Step>
                </ol>
                <div className="mt-4">
                  <label className="label">N° de operación Yape (opcional pero recomendado)</label>
                  <input
                    className="input"
                    inputMode="numeric"
                    placeholder="Ej. 00123456"
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white">El arrendador aún no configuró Yape</h2>
              <p className="mt-2 text-sm text-slate-400">
                Puedes reservar de todas formas y coordinar el pago por mensajes. La reserva
                quedará como <b className="text-white">pendiente de pago</b>.
              </p>
            </div>
          )}

          {/* Protección */}
          <div className="card flex items-start gap-4 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neon-green/15">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Protegido por Rentix</h3>
              <p className="mt-1 text-sm text-slate-400">
                Registramos tu pago y la confirmación del arrendador. Si algo sale mal, puedes
                abrir un reporte desde tu dashboard.
              </p>
            </div>
          </div>

          <button className="btn-primary w-full py-3.5 text-base" disabled={processing || days < 1}>
            {processing ? 'Registrando...' : hasYape ? `Ya pagué ${soles(total)} — Reservar` : 'Reservar y coordinar pago'}
          </button>
        </form>

        {/* Resumen */}
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

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">{n}</span>
      <span>{children}</span>
    </li>
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
