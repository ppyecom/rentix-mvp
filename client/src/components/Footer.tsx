import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.06] bg-ink-950/60">
      <div className="mx-auto max-w-7xl px-5 py-12 text-center">
        <div className="flex justify-center">
          <Logo size={34} />
        </div>
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
          <Link to="/marketplace" className="hover:text-white">Términos de Servicio</Link>
          <Link to="/marketplace" className="hover:text-white">Política de Privacidad</Link>
          <Link to="/marketplace" className="hover:text-white">Garantía de Hardware</Link>
          <Link to="/mensajes" className="hover:text-white">Soporte</Link>
          <Link to="/publicar" className="hover:text-white">Afiliados</Link>
        </nav>
        <p className="mt-6 text-xs text-slate-600">
          © 2026 Rentix Global · Diseñado para el futuro del hardware-as-a-service.
        </p>
      </div>
    </footer>
  );
}
