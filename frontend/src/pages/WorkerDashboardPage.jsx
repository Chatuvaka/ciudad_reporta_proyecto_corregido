import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWorkerReports } from '../services/workerReportsService';

function WorkerDashboardPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getWorkerReports();
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          throw new Error('La ruta de la API no está disponible en el servidor (Devolvió HTML).');
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('workerToken');
          localStorage.removeItem('workerName');
          navigate('/trabajadores/login', { replace: true });
          return;
        }
        setError(err.response?.data?.message || 'No se pudieron cargar los reportes.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [navigate]);

  const receivedCount = reports.filter((report) => report.estado === 'recibido').length;
  const attentionCount = reports.filter((report) => report.estado === 'en_atencion').length;
  const completedCount = reports.filter((report) => report.estado === 'completado').length;
  const canceledCount = reports.filter((report) => report.estado === 'cancelado').length;

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/95 p-8 shadow-[0_20px_60px_rgba(101,73,46,0.08)]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7d614a]">Vista general</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#3e2f23]">Resumen del módulo de trabajadores</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
          Controla la recepción de reportes y actualiza su estado de forma sencilla. En esta sección puedes mover reportes desde "Recibido" hasta "Completado" o cancelarlos con motivo.
        </p>
      </div>

      {error && (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.75rem] border border-[#d7c2aa]/70 bg-[#fff8ef] p-6 shadow-[0_20px_50px_rgba(101,73,46,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7d614a]">Reportes recibidos</p>
          <p className="mt-6 text-5xl font-bold text-[#3e2f23]">{loading ? '—' : receivedCount}</p>
          <p className="mt-4 text-sm text-slate-600">Reportes listos para tomar.</p>
        </div>
        <div className="rounded-[1.75rem] border border-[#d7c2aa]/70 bg-[#eff6ff] p-6 shadow-[0_20px_50px_rgba(101,73,46,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7d614a]">En atención</p>
          <p className="mt-6 text-5xl font-bold text-[#2c5282]">{loading ? '—' : attentionCount}</p>
          <p className="mt-4 text-sm text-slate-600">Reportes actualmente en proceso.</p>
        </div>
        <div className="rounded-[1.75rem] border border-[#d7c2aa]/70 bg-[#ecfdf5] p-6 shadow-[0_20px_50px_rgba(101,73,46,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7d614a]">Completados</p>
          <p className="mt-6 text-5xl font-bold text-[#276749]">{loading ? '—' : completedCount}</p>
          <p className="mt-4 text-sm text-slate-600">Reportes finalizados con éxito.</p>
        </div>
        <div className="rounded-[1.75rem] border border-[#f0b4a8]/80 bg-[#fff1f0] p-6 shadow-[0_20px_50px_rgba(101,73,46,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8b4a42]">Cancelados</p>
          <p className="mt-6 text-5xl font-bold text-[#a33d33]">{loading ? '—' : canceledCount}</p>
          <p className="mt-4 text-sm text-slate-600">Reportes cancelados con motivo registrado.</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/95 p-8 shadow-[0_20px_60px_rgba(101,73,46,0.08)]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-[#3e2f23]">Reportes disponibles</h3>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Revisa la lista de reportes y avanza cada incidencia hacia el siguiente estado.
            </p>
          </div>
          <Link
            to="/trabajadores/panel/reportes"
            className="inline-flex items-center justify-center rounded-3xl bg-[#3854a5] px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(56,84,165,0.22)] transition hover:-translate-y-0.5 hover:bg-[#2f4790]"
          >
            Ver reportes
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WorkerDashboardPage;
