import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearWorkerSession } from '../services/api';

function WorkerLayout() {
  const navigate = useNavigate();
  const workerName = localStorage.getItem('workerName') || 'Trabajador';

  const handleLogout = () => {
    clearWorkerSession();
    navigate('/trabajadores/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f8f3ea] text-slate-900">
      <header className="border-b border-[#d7c2aa]/60 bg-white/95 px-4 py-6 shadow-sm backdrop-blur-md sm:px-6 lg:px-10">
        <div className="mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between max-w-7xl">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7d614a]">Panel de trabajadores</p>
            <h1 className="mt-3 text-3xl font-bold text-[#3e2f23]">Panel de trabajadores</h1>
            <p className="mt-2 text-sm text-slate-600">Bienvenido, {workerName}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/trabajadores/panel"
              className="rounded-full border border-[#d7c2aa] bg-[#fff8ef] px-5 py-3 text-sm font-semibold text-[#5c4d40] transition hover:border-[#b76042] hover:text-[#b76042]"
            >
              Inicio
            </Link>
            <Link
              to="/trabajadores/panel/reportes"
              className="rounded-full border border-[#d7c2aa] bg-[#f0eefc] px-5 py-3 text-sm font-semibold text-[#4c4a7d] transition hover:border-[#6b5fa0] hover:text-[#6b5fa0]"
            >
              Reportes disponibles
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-[#b76042] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(183,96,66,0.2)] transition hover:-translate-y-0.5 hover:bg-[#9b4f33]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default WorkerLayout;
