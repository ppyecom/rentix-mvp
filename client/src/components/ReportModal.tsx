import { useState } from 'react';
import { api } from '../lib/api';

const REASONS: Record<string, string[]> = {
  arrendatario: [
    'Equipo no entregado',
    'Equipo dañado / no funciona',
    'El arrendador no responde',
    'Cobro indebido',
    'Otro',
  ],
  arrendador: [
    'No devolvió el equipo (robo)',
    'Equipo devuelto dañado',
    'No pagó',
    'El arrendatario no responde',
    'Otro',
  ],
};

export function ReportModal({
  bookingId,
  role,
  title,
  onClose,
  onDone,
}: {
  bookingId: number;
  role: 'arrendador' | 'arrendatario';
  title: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const reasons = REASONS[role];
  const [reason, setReason] = useState(reasons[0]);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/reports', { booking_id: bookingId, reason, description });
      onDone();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Reportar un problema</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
        </div>
        <p className="mb-4 text-xs text-slate-400">Sobre la reserva: {title}</p>

        <form onSubmit={submit} className="space-y-4">
          {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{error}</p>}
          <div>
            <label className="label">Motivo</label>
            <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
              {reasons.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="Cuéntanos qué pasó con el mayor detalle posible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button className="btn-primary" disabled={busy}>
              {busy ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
