import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [email, setEmail] = useState('demo@rentix.pe');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/dashboard');
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
        <h1 className="mt-4 text-2xl font-bold text-white">Bienvenido de vuelta</h1>
        <p className="mt-1 text-sm text-slate-400">Ingresa para gestionar tus alquileres.</p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        {error && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400 ring-1 ring-rose-500/20">
            {error}
          </p>
        )}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p className="rounded-lg bg-brand-500/5 px-3 py-2 text-center text-xs text-slate-400 ring-1 ring-brand-500/15">
          Cuenta demo pre-cargada · <span className="text-slate-200">demo@rentix.pe</span> / demo1234
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-brand-400 hover:underline">
          Crea una gratis
        </Link>
      </p>
    </div>
  );
}
