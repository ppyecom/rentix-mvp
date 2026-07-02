import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Avatar } from './ui';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/marketplace', label: 'Explorar' },
  { to: '/marketplace?category=Computación', label: 'Laptops' },
  { to: '/marketplace?category=Cine', label: 'Cámaras' },
  { to: '/marketplace?category=Audio', label: 'Audio' },
  { to: '/marketplace?category=Gaming', label: 'Gaming' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);

  function search(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/marketplace?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5">
        <Logo size={28} />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={search} className="ml-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar equipos..."
              className="w-full rounded-full bg-ink-800 py-2 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-500 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-brand-500/60"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Link to="/mensajes" className="grid h-9 w-9 place-items-center rounded-full text-slate-400 ring-1 ring-white/10 transition hover:text-white hover:bg-white/5" aria-label="Mensajes">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-full p-0.5 ring-1 ring-white/10 hover:ring-brand-500/50">
                <Avatar src={user.avatar} alt={user.name} size={32} />
              </button>
              {menu && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl bg-ink-800 p-1.5 ring-1 ring-white/10 shadow-card" onMouseLeave={() => setMenu(false)}>
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <MenuItem to="/dashboard" onClick={() => setMenu(false)}>Mi Dashboard</MenuItem>
                  <MenuItem to="/publicar" onClick={() => setMenu(false)}>Publicar equipo</MenuItem>
                  <MenuItem to="/mensajes" onClick={() => setMenu(false)}>Mensajes</MenuItem>
                  <button onClick={() => { logout(); setMenu(false); navigate('/'); }} className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-400 hover:bg-white/5">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline hidden sm:inline-flex">Ingresar</Link>
              <Link to="/registro" className="btn-primary">Crear cuenta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
      {children}
    </Link>
  );
}
