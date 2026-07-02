import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { User } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui';

const cities = ['Lima, Perú', 'Arequipa, Perú', 'Cusco, Perú', 'Trujillo, Perú', 'Piura, Perú'];

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    city: user?.city || cities[0],
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    yape_number: user?.yape_number || '',
    yape_name: user?.yape_name || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setOk(false);
  }

  // Redimensiona la foto en el navegador antes de guardarla como data URL.
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('El archivo debe ser una imagen'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        set('avatar', canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const r = await api.put<{ user: User }>('/users/me', form);
      updateUser(r.user);
      setOk(true);
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="mb-1 text-3xl font-bold text-white">Editar <span className="gradient-text">Perfil</span></h1>
      <p className="mb-8 text-sm text-slate-400">Actualiza tu información pública en Rentix.</p>

      <form onSubmit={submit} className="card space-y-5 p-6">
        {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{error}</p>}
        {ok && <p className="rounded-lg bg-neon-green/10 px-3 py-2 text-sm text-neon-green">✓ Perfil actualizado</p>}

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <Avatar src={form.avatar} alt={form.name || 'U'} size={72} />
          <div>
            <label className="btn-ghost cursor-pointer">
              📷 Cambiar foto
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
            <p className="mt-1 text-xs text-slate-500">JPG o PNG, se redimensiona automáticamente.</p>
          </div>
        </div>

        <div>
          <label className="label">Nombre</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="label">Correo (no editable)</label>
          <input className="input opacity-60" value={user?.email || ''} disabled />
        </div>
        <div>
          <label className="label">Ciudad</label>
          <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)}>
            {cities.map((c) => <option key={c}>{c}</option>)}
            {!cities.includes(form.city) && <option>{form.city}</option>}
          </select>
        </div>
        <div>
          <label className="label">Biografía</label>
          <textarea
            className="input resize-none"
            rows={3}
            maxLength={280}
            placeholder="Cuéntale a la comunidad quién eres y qué equipos ofreces..."
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
          />
          <p className="mt-1 text-right text-xs text-slate-500">{form.bio.length}/280</p>
        </div>

        {/* Datos de cobro con Yape */}
        <div className="rounded-xl bg-violet-500/5 p-4 ring-1 ring-violet-500/15">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/20 text-sm">💜</span>
            <div>
              <h3 className="text-sm font-semibold text-white">Cobros con Yape</h3>
              <p className="text-xs text-slate-400">Para recibir pagos cuando alquilen tus equipos.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Número Yape</label>
              <input
                className="input"
                inputMode="numeric"
                maxLength={9}
                placeholder="9XXXXXXXX"
                value={form.yape_number}
                onChange={(e) => set('yape_number', e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label className="label">Nombre en Yape</label>
              <input
                className="input"
                placeholder="Como aparece en tu cuenta"
                value={form.yape_name}
                onChange={(e) => set('yape_name', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
