import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Equipment, Booking, Report } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { soles } from '../lib/format';
import { Avatar, Stars, StatusBadge, PaymentBadge, Pin, Spinner, VerifiedTick } from '../components/ui';
import { ReportModal } from '../components/ReportModal';

type Tab = 'reservas' | 'recibidas' | 'equipos' | 'reportes';

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [received, setReceived] = useState<Booking[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [earned, setEarned] = useState(0);
  const [pendingConfirms, setPendingConfirms] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('reservas');
  const [reportFor, setReportFor] = useState<{ id: number; role: 'arrendador' | 'arrendatario'; title: string } | null>(null);

  function load() {
    return Promise.all([
      api.get<{ equipment: Equipment[] }>('/equipment/mine/list'),
      api.get<{ bookings: Booking[] }>('/bookings/mine'),
      api.get<{ bookings: Booking[] }>('/bookings/received'),
      api.get<{ earned: number; pending_confirmations: number }>('/bookings/earnings'),
      api.get<{ reports: Report[] }>('/reports/mine'),
    ]).then(([e, b, rec, earn, rep]) => {
      setListings(e.equipment);
      setBookings(b.bookings);
      setReceived(rec.bookings);
      setEarned(earn.earned);
      setPendingConfirms(earn.pending_confirmations);
      setReports(rep.reports);
    });
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function confirmPayment(id: number) {
    await api.post(`/bookings/${id}/confirm`);
    await load();
  }

  if (loading) return <Spinner label="Cargando tu dashboard..." />;

  const spent = bookings.reduce((s, b) => s + b.total, 0);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      {/* Perfil */}
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

      {/* Alerta de confirmaciones pendientes */}
      {pendingConfirms > 0 && (
        <button
          onClick={() => setTab('recibidas')}
          className="mt-4 flex w-full items-center gap-3 rounded-xl bg-neon-cyan/10 px-4 py-3 text-left text-sm ring-1 ring-neon-cyan/25 transition hover:bg-neon-cyan/15"
        >
          <span className="text-lg">🔔</span>
          <span className="text-slate-200">
            Tienes <b className="text-neon-cyan">{pendingConfirms}</b> pago(s) reportado(s) por confirmar. Revisa "Reservas recibidas".
          </span>
        </button>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Mis equipos" value={String(listings.length)} />
        <Stat label="Reservas hechas" value={String(bookings.length)} />
        <Stat label="Gasto total" value={soles(spent)} />
        <Stat label="Ingresos confirmados" value={soles(earned)} accent />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/[0.06]">
        <TabBtn active={tab === 'reservas'} onClick={() => setTab('reservas')}>Mis reservas</TabBtn>
        <TabBtn active={tab === 'recibidas'} onClick={() => setTab('recibidas')}>
          Reservas recibidas {pendingConfirms > 0 && <Dot />}
        </TabBtn>
        <TabBtn active={tab === 'equipos'} onClick={() => setTab('equipos')}>Mis equipos</TabBtn>
        <TabBtn active={tab === 'reportes'} onClick={() => setTab('reportes')}>
          Reportes {reports.length > 0 && <span className="ml-1 text-xs text-slate-500">({reports.length})</span>}
        </TabBtn>
      </div>

      {/* Mis reservas (como arrendatario) */}
      {tab === 'reservas' && (
        <div className="mt-6 space-y-3">
          {bookings.length === 0 ? (
            <Empty text="Aún no tienes reservas." cta="Explorar marketplace" to="/marketplace" />
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <img src={b.equipment_image} alt="" className="h-16 w-16 rounded-xl object-cover ring-1 ring-white/10" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{b.equipment_title}</p>
                  <p className="text-xs text-slate-400">{b.start_date} → {b.end_date} · {b.days} día(s)</p>
                  <div className="mt-1"><PaymentBadge status={b.payment_status} /></div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <p className="font-bold gradient-text">{soles(b.total)}</p>
                  <button
                    onClick={() => setReportFor({ id: b.id, role: 'arrendatario', title: b.equipment_title || '' })}
                    className="text-xs font-medium text-slate-500 hover:text-rose-400"
                  >
                    Reportar problema
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reservas recibidas (como arrendador) */}
      {tab === 'recibidas' && (
        <div className="mt-6 space-y-3">
          {received.length === 0 ? (
            <Empty text="Nadie ha alquilado tus equipos todavía." cta="Publicar un equipo" to="/publicar" />
          ) : (
            received.map((b) => (
              <div key={b.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <img src={b.equipment_image} alt="" className="h-16 w-16 rounded-xl object-cover ring-1 ring-white/10" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{b.equipment_title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                    <Avatar src={b.renter_avatar} alt={b.renter_name || 'U'} size={18} />
                    {b.renter_name} · {b.days} día(s)
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <PaymentBadge status={b.payment_status} />
                    {b.yape_operation && <span className="text-xs text-slate-500">Op: {b.yape_operation}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <p className="font-bold text-white">{soles(b.subtotal)}</p>
                  {b.payment_status === 'pago_reportado' ? (
                    <button onClick={() => confirmPayment(b.id)} className="btn-primary py-1.5 text-xs">
                      ✓ Confirmar pago recibido
                    </button>
                  ) : (
                    <button
                      onClick={() => setReportFor({ id: b.id, role: 'arrendador', title: b.equipment_title || '' })}
                      className="text-xs font-medium text-slate-500 hover:text-rose-400"
                    >
                      Reportar problema
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mis equipos */}
      {tab === 'equipos' && (
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

      {/* Reportes */}
      {tab === 'reportes' && (
        <div className="mt-6 space-y-3">
          {reports.length === 0 ? (
            <div className="card p-14 text-center text-slate-400">
              <p>No tienes reportes.</p>
              <p className="mt-1 text-sm text-slate-500">Si algo sale mal con una reserva, ábrelo desde la reserva correspondiente.</p>
            </div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`chip ${r.direction === 'enviado' ? 'bg-brand-500/15 text-brand-400 ring-brand-500/30' : 'bg-rose-500/15 text-rose-400 ring-rose-500/30'}`}>
                      {r.direction === 'enviado' ? 'Enviado por ti' : 'En tu contra'}
                    </span>
                    <span className="font-semibold text-white">{r.reason}</span>
                  </div>
                  <span className={`chip ${
                    r.status === 'resuelto' ? 'bg-neon-green/15 text-neon-green ring-neon-green/30'
                    : r.status === 'en_revision' ? 'bg-amber-500/15 text-amber-400 ring-amber-500/30'
                    : 'bg-ink-700 text-slate-300'
                  }`}>
                    {r.status === 'en_revision' ? 'En revisión' : r.status === 'resuelto' ? 'Resuelto' : 'Abierto'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{r.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Equipo: {r.equipment_title} · {new Date(r.created_at).toLocaleDateString('es-PE')}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {reportFor && (
        <ReportModal
          bookingId={reportFor.id}
          role={reportFor.role}
          title={reportFor.title}
          onClose={() => setReportFor(null)}
          onDone={() => { setReportFor(null); load().then(() => setTab('reportes')); }}
        />
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
      className={`-mb-px flex items-center border-b-2 px-4 py-3 text-sm font-semibold transition ${
        active ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function Dot() {
  return <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-neon-cyan" />;
}

function Empty({ text, cta, to }: { text: string; cta: string; to: string }) {
  return (
    <div className="card p-14 text-center">
      <p className="text-slate-400">{text}</p>
      <Link to={to} className="btn-primary mt-4">{cta}</Link>
    </div>
  );
}
