import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerReportes } from '../services/api';
import { getReportStatusCardClasses, getReportStatusClasses, getReportStatusLabel } from '../services/workerReportsService';

const STATUS_TABS = [
  {
    key: 'recibido',
    label: 'En proceso',
    description: 'Reportes recibidos y listos para ser atendidos.',
  },
  {
    key: 'en_atencion',
    label: 'En atención',
    description: 'Casos que ya tomó un trabajador.',
  },
  {
    key: 'completado',
    label: 'Completados',
    description: 'Reportes finalizados por el equipo responsable.',
  },
];

function formatDate(value) {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Dashboard() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('recibido');

  const fetchReportes = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await obtenerReportes();
      setReportes(res.data);
    } catch {
      setError('No se pudieron cargar los reportes. Revisa que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();

    const interval = setInterval(fetchReportes, 5000);
    return () => clearInterval(interval);
  }, []);

  const counts = useMemo(() => (
    STATUS_TABS.reduce((acc, tab) => {
      acc[tab.key] = reportes.filter((reporte) => reporte.estado === tab.key).length;
      return acc;
    }, {})
  ), [reportes]);

  const activeTab = STATUS_TABS.find((tab) => tab.key === activeStatus) || STATUS_TABS[0];
  const filtrados = reportes.filter((reporte) => reporte.estado === activeStatus);

  return (
    <main className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
      <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#f6e7d3]/80 blur-3xl" />
      <div className="absolute left-0 top-24 h-40 w-40 rounded-full bg-[#d6eef4]/35 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <section className="mb-8 rounded-[2rem] border border-[#d7c2aa]/60 bg-[#fff8ef]/95 p-6 shadow-[0_25px_80px_rgba(101,73,46,0.1)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[#7d614a]">Portal ciudadano</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#3e2f23] sm:text-5xl">
                Seguimiento de reportes
              </h1>
              <p className="mt-4 text-base leading-8 text-[#6d523f]/90">
                Consulta los casos en proceso, los que están siendo atendidos y los que ya fueron completados.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-[#d4752a] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(183,96,66,0.24)] transition-all duration-200 hover:-translate-y-0.5"
            >
              Nuevo reporte
            </Link>
          </div>
        </section>

        <section className="mb-8 rounded-[2rem] border border-[#d7c2aa]/60 bg-[#fff8ef]/90 p-4 shadow-[0_25px_50px_rgba(101,73,46,0.08)] sm:p-6">
          <div className="grid gap-3 md:grid-cols-3" role="tablist" aria-label="Estados de reportes">
            {STATUS_TABS.map((tab) => {
              const active = activeStatus === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveStatus(tab.key)}
                  className={`rounded-[1.25rem] border p-4 text-left transition-all duration-200 ${
                    active
                      ? `${getReportStatusCardClasses(tab.key)} shadow-[0_14px_32px_rgba(101,73,46,0.12)]`
                      : 'border-[#e4d3ba] bg-white/80 hover:border-[#d4752a] hover:bg-[#fff5e9]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-bold text-[#3e2f23]">{tab.label}</span>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-[#b76042]">
                      {loading ? '...' : counts[tab.key] || 0}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6d523f]">{tab.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <section className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/80 p-12 text-center shadow-[0_20px_40px_rgba(101,73,46,0.08)]">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#c9b297] border-t-transparent" />
            <p className="text-[#6d523f]">Cargando reportes...</p>
          </section>
        ) : error ? (
          <section className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/80 p-12 text-center shadow-[0_20px_40px_rgba(101,73,46,0.08)]">
            <span className="mb-4 block text-4xl">⚠️</span>
            <p className="mb-4 text-[#b45d31]">{error}</p>
            <button
              type="button"
              onClick={fetchReportes}
              className="rounded-full bg-[#f3e3d0] px-5 py-3 text-sm font-semibold text-[#6d523f] shadow-[0_12px_25px_rgba(101,73,46,0.10)] hover:bg-[#efdbc6]"
            >
              Reintentar
            </button>
          </section>
        ) : filtrados.length === 0 ? (
          <section className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/80 p-12 text-center shadow-[0_20px_40px_rgba(101,73,46,0.08)]">
            <span className="mb-4 block text-5xl">📭</span>
            <h2 className="text-2xl font-bold text-[#3e2f23]">Sin reportes {activeTab.label.toLowerCase()}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#7d614a]">
              Cuando exista un caso en este estado, aparecerá aquí con su tipo de problema, descripción, dirección y ciudadano.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-2" aria-label={`Reportes ${activeTab.label.toLowerCase()}`}>
            {filtrados.map((reporte) => (
              <article
                key={reporte.id}
                className={`rounded-[1.75rem] border p-5 shadow-[0_18px_45px_rgba(101,73,46,0.09)] sm:p-6 ${getReportStatusCardClasses(reporte.estado)}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b6f54]">
                      Reporte #{reporte.id}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight text-[#3e2f23]">
                      {reporte.tipo}
                    </h2>
                  </div>
                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getReportStatusClasses(reporte.estado)}`}>
                    {getReportStatusLabel(reporte.estado)}
                  </span>
                </div>

                <dl className="mt-6 grid gap-4">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b6f54]">Descripción</dt>
                    <dd className="mt-2 break-words text-base leading-7 text-[#514131]">{reporte.descripcion}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b6f54]">Dirección</dt>
                    <dd className="mt-2 break-words text-base leading-7 text-[#514131]">{reporte.ubicacion}</dd>
                  </div>
                  {reporte.senas_lugar && (
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b6f54]">Señas del lugar</dt>
                      <dd className="mt-2 break-words text-base leading-7 text-[#514131]">{reporte.senas_lugar}</dd>
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b6f54]">Reportado por</dt>
                      <dd className="mt-2 text-base font-semibold text-[#3e2f23]">{reporte.ciudadano || 'Anónimo'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b6f54]">Fecha</dt>
                      <dd className="mt-2 text-base text-[#514131]">{formatDate(reporte.fecha || reporte.fecha_creacion)}</dd>
                    </div>
                  </div>
                </dl>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
