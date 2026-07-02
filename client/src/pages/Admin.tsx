import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { soles } from '../lib/format';
import { Spinner } from '../components/ui';

interface AdminReport {
  id: number;
  reason: string;
  description: string;
  status: 'abierto' | 'en_revision' | 'resuelto';
  reporter_role: string;
  reporter_name: string;
  reporter_email: string;
  against_name: string;
  against_email: string;
  equipment_title: string;
  booking_total: number;
  created_at: string;
}

interface Stats {
  users: number;
  equipment: number;
  bookings: number;
  revenue: number;
  reports_open: number;
  reports_total: number;
}

const FILTERS = [
  { key: '', label: 'Todos' },
  { key: 'abierto', label: 'Abiertos' },
  { key: 'en_revision', label: 'En revisión' },
  { key: 'resuelto', label: 'Resueltos' },
];

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  function loadReports(f: string) {
    return api
      .get<{ reports: AdminReport[] }>(`/admin/reports${f ? `?status=${f}` : ''}`)
      .then((r) => setReports(r.reports));
  }

  useEffect(() => {
    Promise.all([api.get<Stats>('/admin/stats'), loadReports('')]).then(([s]) => setStats(s)).finally(() => setLoading(false));
  }, []);

  function changeFilter(f: string) {
    setFilter(f);
    loadReports(f);
  }

  async function setStatus(id: number, status: string) {
    await api.put(`/admin/reports/${id}`, { status });
    await Promise.all([api.get<Stats>('/admin/stats').then(setStats), loadReports(filter)]);
  }

  if (loading) return <Spinner label="Cargando panel de soporte..." />;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-lg">🛠️</span>
        <div>
          <h1 className="text-3xl font-bold text-white">Panel de <span className="gradient-text">Soporte</span></h1>
          <p className="text-sm text-slate-400">Moderación de disputas y salud de la plataforma.</p>
        </div>
      </div>

      {/* Métricas */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Metric label="Usuarios" value={String(stats.users)} />
          <Metric label="Equipos" value={String(stats.equipment)} />
          <Metric label="Reservas" value={String(stats.bookings)} />
          <Metric label="Comisiones" value={soles(stats.revenue)} accent />
          <Metric label="Reportes abiertos" value={String(stats.reports_open)} warn={stats.reports_open > 0} />
          <Metric label="Reportes totales" value={String(stats.reports_total)} />
        </div>
      )}

      {/* Filtros */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => changeFilter(f.key)}
            className={`chip ${filter === f.key ? 'bg-brand-gradient text-white ring-transparent' : 'bg-ink-800 text-slate-300 hover:bg-ink-700'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reportes */}
      {reports.length === 0 ? (
        <div className="card p-14 text-center text-slate-400">No hay reportes en esta vista.</div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{r.reason}</span>
                    <span className="chip bg-ink-700 text-xs text-slate-300">#{r.id}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{r.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                    <span>👤 Reporta: <b className="text-slate-300">{r.reporter_name}</b> ({r.reporter_role}) · {r.reporter_email}</span>
                    <span>🎯 Contra: <b className="text-slate-300">{r.against_name}</b> · {r.against_email}</span>
                    <span>📦 {r.equipment_title} · {soles(r.booking_total)}</span>
                    <span>🗓️ {new Date(r.created_at).toLocaleDateString('es-PE')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`chip ${
                    r.status === 'resuelto' ? 'bg-neon-green/15 text-neon-green ring-neon-green/30'
                    : r.status === 'en_revision' ? 'bg-amber-500/15 text-amber-400 ring-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 ring-rose-500/30'
                  }`}>
                    {r.status === 'en_revision' ? 'En revisión' : r.status === 'resuelto' ? 'Resuelto' : 'Abierto'}
                  </span>
                  <select
                    value={r.status}
                    onChange={(e) => setStatus(r.id, e.target.value)}
                    className="rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10 outline-none"
                  >
                    <option value="abierto">Marcar Abierto</option>
                    <option value="en_revision">Marcar En revisión</option>
                    <option value="resuelto">Marcar Resuelto</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-black ${warn ? 'text-rose-400' : accent ? 'gradient-text' : 'text-white'}`}>{value}</p>
    </div>
  );
}
