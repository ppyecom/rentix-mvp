import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Equipment } from '../lib/types';
import { soles } from '../lib/format';

const cats = ['Computación', 'Cine', 'Audio', 'Inmersivo', 'Gaming', 'Iluminación'];
const cities = ['Lima, Perú', 'Arequipa, Perú', 'Cusco, Perú', 'Trujillo, Perú', 'Piura, Perú'];

export default function Publish() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: cats[0], price_per_day: '',
    city: cities[0],
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80',
  });
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([{ label: '', value: '' }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function setSpec(i: number, key: 'label' | 'value', v: string) {
    setSpecs((s) => s.map((sp, idx) => (idx === i ? { ...sp, [key]: v } : sp)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const r = await api.post<{ equipment: Equipment }>('/equipment', {
        ...form,
        price_per_day: Number(form.price_per_day),
        gallery: [form.image],
        specs: specs.filter((s) => s.label && s.value),
      });
      navigate(`/equipo/${r.equipment.id}`);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <h1 className="mb-1 text-3xl font-bold text-white">Publicar <span className="gradient-text">Nuevo Equipo</span></h1>
      <p className="mb-8 text-sm text-slate-400">Monetiza tu tecnología. Publica en minutos y empieza a generar ingresos.</p>

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <h2 className="text-lg font-bold text-white">Información básica</h2>
            {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{error}</p>}
            <div>
              <label className="label">Título del equipo</label>
              <input className="input" placeholder="Ej. Sony A7 IV Mirrorless" value={form.title} onChange={(e) => set('title', e.target.value)} required />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea className="input resize-none" rows={4} placeholder="Describe el equipo, qué incluye y su estado..." value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Categoría</label>
                <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {cats.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Ciudad</label>
                <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)}>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Precio por día (S/)</label>
              <input className="input" type="number" min="1" placeholder="120" value={form.price_per_day} onChange={(e) => set('price_per_day', e.target.value)} required />
            </div>
            <div>
              <label className="label">URL de imagen</label>
              <input className="input" value={form.image} onChange={(e) => set('image', e.target.value)} />
            </div>
          </div>

          <div className="card space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Especificaciones</h2>
              <button type="button" onClick={() => setSpecs((s) => [...s, { label: '', value: '' }])} className="btn-ghost text-xs">+ Añadir</button>
            </div>
            {specs.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Etiqueta (ej. Sensor)" value={s.label} onChange={(e) => setSpec(i, 'label', e.target.value)} />
                <input className="input" placeholder="Valor (ej. Full-Frame)" value={s.value} onChange={(e) => setSpec(i, 'value', e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">Vista previa</p>
          <div className="card overflow-hidden">
            <img src={form.image} alt="preview" className="aspect-[4/3] w-full object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-white">{form.title || 'Título del equipo'}</h3>
              <p className="mt-1 text-xs text-slate-400">{form.city}</p>
              <p className="mt-3 text-lg font-bold gradient-text">
                {form.price_per_day ? soles(Number(form.price_per_day)) : 'S/ 0'}
                <span className="ml-1 text-xs font-normal text-slate-400">/ día</span>
              </p>
            </div>
          </div>
          <button className="btn-primary mt-4 w-full" disabled={busy}>
            {busy ? 'Publicando...' : 'Publicar equipo'}
          </button>
          <p className="mt-2 text-center text-xs text-slate-500">Comisión Rentix del 10% por alquiler exitoso.</p>
        </aside>
      </form>
    </div>
  );
}
