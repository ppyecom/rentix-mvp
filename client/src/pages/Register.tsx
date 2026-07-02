import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/Logo';

const cities = ['Lima, Perú', 'Arequipa, Perú', 'Cusco, Perú', 'Trujillo, Perú', 'Piura, Perú'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', city: cities[0] });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password, form.city);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <LogoMark size={52} />
        <h1 className="mt-4 text-2xl font-bold text-white">Únete a Rentix</h1>
        <p className="mt-1 text-sm text-slate-400">
          Alquila o monetiza tus equipos tecnológicos.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        {error && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400 ring-1 ring-rose-500/20">
            {error}
          </p>
        )}
        <div>
          <label className="label">Nombre completo</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input className="input" type="password" minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} required />
        </div>
        <div>
          <label className="label">Ciudad</label>
          <select className="input" value={form.city} onChange={(e) => set('city', e.target.value)}>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-neon-green/5 px-3 py-2 text-xs text-slate-400 ring-1 ring-neon-green/15">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
          Verificación de identidad simulada · Tu cuenta se marca como verificada.
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-brand-400 hover:underline">
          Ingresa
        </Link>
      </p>
    </div>
  );
}
