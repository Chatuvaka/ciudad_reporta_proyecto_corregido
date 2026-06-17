import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'INICIO' },
    { to: '/dashboard', label: 'SEGUIMIENTO' },
    { to: '/ayuda', label: 'AYUDA' },
  ];

  const linkClass = (to) =>
    `a11y-body font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 ${
      pathname === to ? 'text-[#b85f3d]' : 'text-[#2b211a] hover:text-[#b85f3d]'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#c9a27d]/30 bg-[var(--bg-light)]/95 backdrop-blur-xl shadow-sm shadow-slate-300/12">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#d4b494] bg-[#f8efe0]/90 shadow-[0_10px_30px_rgba(131,90,53,0.08)] sm:h-16 sm:w-16">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ddb98c] text-base font-bold text-[#5c3d28] sm:h-12 sm:w-12 sm:text-lg">
              SG
            </div>
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-base font-bold uppercase tracking-[0.14em] text-[var(--text-primary)] sm:text-xl sm:tracking-[0.32em]">Ciudad Reporta</span>
            <span className="truncate text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)] sm:text-[22px] sm:tracking-[0.18em]">Portal ciudadano</span>
          </div>
        </Link>

        <button
          type="button"
          className="inline-flex items-center gap-3 rounded-2xl border border-[#c9a27d]/40 bg-[var(--bg-light)] px-4 py-2 text-[var(--text-primary)] shadow-sm md:hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 a11y-btn-large"
          onClick={() => setOpen((current) => !current)}
          aria-label="Abrir menú"
        >
          <span className="text-lg">☰</span>
          Menú
        </button>

        <nav aria-label="Navegación principal" className={`order-3 w-full flex-1 ${open ? 'block' : 'hidden'} md:order-none md:block md:w-auto`}>
          <ul className="flex flex-col gap-3 rounded-3xl border border-slate-200/60 bg-[#fbf2e4]/80 p-4 shadow-[0_20px_60px_rgba(94,64,41,0.06)] backdrop-blur-md md:flex-row md:items-center md:justify-center md:border-none md:bg-transparent md:p-0 md:shadow-none">
            {navItems.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center font-semibold text-[var(--text-primary)] md:px-3 md:py-0">
                <Link to={item.to} className={`${linkClass(item.to)} a11y-body focus-visible-large`} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
                {index < navItems.length - 1 && (
                  <span className="hidden md:inline-block mx-4 h-6 w-px bg-[#e2d4c7]" />
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
