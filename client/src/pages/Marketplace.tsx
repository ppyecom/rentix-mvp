import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Equipment } from '../lib/types';
import { EquipmentCard } from '../components/EquipmentCard';
import { Spinner } from '../components/ui';

const cats = ['Todo', 'Computación', 'Cine', 'Audio', 'Inmersivo', 'Gaming', 'Iluminación'];

export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'Todo';
  const q = params.get('q') || '';
  const sort = params.get('sort') || 'recent';

  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category !== 'Todo') qs.set('category', category);
    if (q) qs.set('q', q);
    if (sort) qs.set('sort', sort);
    api.get<{ equipment: Equipment[] }>(`/equipment?${qs.toString()}`)
      .then((r) => setItems(r.equipment))
      .finally(() => setLoading(false));
  }, [category, q, sort]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value && value !== 'Todo') next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          Marketplace de <span className="gradient-text">Equipos</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {loading ? 'Buscando...' : `${items.length} equipos disponibles`}
          {q && <> · resultados para "<span className="text-slate-200">{q}</span>"</>}
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-5">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => update('category', c)}
            className={`chip ${
              category === c
                ? 'bg-brand-gradient text-white ring-transparent'
                : 'bg-ink-800 text-slate-300 hover:bg-ink-700'
            }`}
          >
            {c}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => update('sort', e.target.value)}
          className="ml-auto rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-semibold text-slate-300 ring-1 ring-white/10 outline-none"
        >
          <option value="recent">Más recientes</option>
          <option value="rating">Mejor valorados</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <p className="text-lg font-semibold text-white">Sin resultados</p>
          <p className="mt-1 text-sm">Prueba con otra categoría o término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((eq) => (
            <EquipmentCard key={eq.id} eq={eq} />
          ))}
        </div>
      )}
    </div>
  );
}
