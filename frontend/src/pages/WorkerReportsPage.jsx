import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  cancelReport,
  getReportStatusCardClasses,
  completeReport,
  getReportStatusClasses,
  getReportStatusLabel,
  getWorkerReports,
  takeReport,
} from '../services/workerReportsService';

const STATUS_FILTERS = [
  {
    key: 'recibido',
    label: 'Recibidos',
    description: 'Reportes nuevos listos para tomar.',
  },
  {
    key: 'en_atencion',
    label: 'En atención',
    description: 'Casos que ya están en proceso.',
  },
  {
    key: 'completado',
    label: 'Completados',
    description: 'Reportes cerrados correctamente.',
  },
  {
    key: 'cancelado',
    label: 'Cancelados',
    description: 'Reportes cerrados con motivo.',
  },
];

function formatDate(value) {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function WorkerReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStatus, setActiveStatus] = useState('recibido');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [canceling, setCanceling] = useState(false);

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

      setError(err.response?.data?.message || 'No se pudieron cargar los reportes. Revisa que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleTakeReport = async (id) => {
    try {
      await takeReport(id);
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo tomar el reporte.');
    }
  };

  const handleCompleteReport = async (id) => {
    try {
      await completeReport(id);
      await loadReports();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo completar el reporte.');
    }
  };

  const openCancelDialog = (report) => {
    setCancelTarget(report);
    setCancelReason('');
    setCancelError('');
  };

  const closeCancelDialog = () => {
    if (canceling) return;
    setCancelTarget(null);
    setCancelReason('');
    setCancelError('');
  };

  const handleCancelReport = async () => {
    const reason = cancelReason.trim();

    if (reason.length < 10) {
      setCancelError('Escribe un motivo de al menos 10 caracteres.');
      return;
    }

    try {
      setCanceling(true);
      setCancelError('');
      await cancelReport(cancelTarget.id, reason);
      setCancelTarget(null);
      setCancelReason('');
      await loadReports();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'No se pudo cancelar el reporte.');
    } finally {
      setCanceling(false);
    }
  };

  const counts = useMemo(() => (
    STATUS_FILTERS.reduce((acc, filter) => {
      acc[filter.key] = reports.filter((report) => report.estado === filter.key).length;
      return acc;
    }, {})
  ), [reports]);

  const activeFilter = STATUS_FILTERS.find((filter) => filter.key === activeStatus) || STATUS_FILTERS[0];
  const filteredReports = useMemo(
    () => reports.filter((report) => report.estado === activeStatus),
    [reports, activeStatus]
  );

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/95 p-8 shadow-[0_20px_60px_rgba(101,73,46,0.08)]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7d614a]">Reportes disponibles</p>
        <h2 className="mt-3 text-3xl font-semibold text-[#3e2f23]">Reportes para atención</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
          Aquí puedes ver los reportes recibidos, tomar uno para empezar a trabajar, completarlo o cancelarlo con motivo.
        </p>
      </div>

      {error && (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/95 p-5 shadow-[0_20px_60px_rgba(101,73,46,0.08)]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" role="tablist" aria-label="Filtrar reportes por estado">
          {STATUS_FILTERS.map((filter) => {
            const active = activeStatus === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveStatus(filter.key)}
                className={`rounded-[1.25rem] border p-4 text-left transition-all duration-200 ${
                  active
                    ? `${getReportStatusCardClasses(filter.key)} shadow-[0_14px_32px_rgba(101,73,46,0.12)]`
                    : 'border-[#e4d3ba] bg-[#fffaf5] hover:border-[#c9a27d] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-[#3e2f23]">{filter.label}</span>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-[#3e2f23]">
                    {loading ? '...' : counts[filter.key] || 0}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{filter.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="rounded-[1.75rem] border border-[#d7c2aa]/60 bg-[#fff8ef] p-8 text-center text-slate-700 shadow-[0_20px_50px_rgba(101,73,46,0.08)]">
            Cargando reportes...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-[1.75rem] border border-[#d7c2aa]/60 bg-[#fff8ef] p-8 text-center text-slate-700 shadow-[0_20px_50px_rgba(101,73,46,0.08)]">
            No hay reportes disponibles en este momento.
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="rounded-[1.75rem] border border-[#d7c2aa]/60 bg-[#fff8ef] p-8 text-center text-slate-700 shadow-[0_20px_50px_rgba(101,73,46,0.08)]">
            No hay reportes {activeFilter.label.toLowerCase()} en este momento.
          </div>
        ) : (
          filteredReports.map((report) => {
            const statusClasses = getReportStatusClasses(report.estado);
            const statusLabel = getReportStatusLabel(report.estado);

            return (
              <article key={report.id} className={`rounded-[1.75rem] border p-6 shadow-[0_20px_50px_rgba(101,73,46,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_rgba(101,73,46,0.14)] ${getReportStatusCardClasses(report.estado)}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.25em] text-[#7d614a]">Reporte #{report.id}</p>
                    <h3 className="text-2xl font-semibold text-[#3e2f23]">{report.tipo}</h3>
                    <p className="text-sm leading-7 text-slate-700">
                      <span className="font-semibold text-slate-800">Ciudadano:</span> {report.ciudadano || 'Anónimo'}
                    </p>
                    <p className="text-sm leading-7 text-slate-700">
                      <span className="font-semibold text-slate-800">Ubicación:</span> {report.ubicacion}
                    </p>
                    {report.senas_lugar && (
                      <p className="text-sm leading-7 text-slate-700">
                        <span className="font-semibold text-slate-800">Señas del lugar:</span> {report.senas_lugar}
                      </p>
                    )}
                    <p className="text-sm leading-7 text-slate-700">
                      <span className="font-semibold text-slate-800">Descripción:</span> {report.descripcion}
                    </p>
                    {report.estado === 'cancelado' && report.motivo_cancelacion && (
                      <p className="text-sm leading-7 text-red-700">
                        <span className="font-semibold">Motivo de cancelación:</span> {report.motivo_cancelacion}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusClasses}`}>
                      {statusLabel}
                    </span>
                    <p className="text-sm text-slate-500">{formatDate(report.fecha || report.fecha_creacion)}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    to={`/trabajadores/panel/reportes/${report.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-[#d7c2aa] bg-[#fbf6f0] px-5 py-3 text-sm font-semibold text-[#5c4d40] transition hover:border-[#b76042] hover:text-[#b76042]"
                  >
                    Ver detalle
                  </Link>

                  <div className="flex flex-wrap gap-3">
                    {report.estado === 'recibido' && (
                      <button
                        type="button"
                        onClick={() => handleTakeReport(report.id)}
                        className="inline-flex items-center justify-center rounded-3xl bg-[#f6c24c] px-5 py-3 text-sm font-semibold text-[#744f0b] shadow-[0_12px_25px_rgba(182,136,40,0.18)] transition hover:-translate-y-0.5 hover:bg-[#e4b438]"
                      >
                        Tomar reporte
                      </button>
                    )}
                    {report.estado === 'en_atencion' && (
                      <button
                        type="button"
                        onClick={() => handleCompleteReport(report.id)}
                        className="inline-flex items-center justify-center rounded-3xl bg-[#4f9c74] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,156,116,0.22)] transition hover:-translate-y-0.5 hover:bg-[#3b7b5c]"
                      >
                        Marcar como completado
                      </button>
                    )}
                    {(report.estado === 'recibido' || report.estado === 'en_atencion') && (
                      <button
                        type="button"
                        onClick={() => openCancelDialog(report)}
                        className="inline-flex items-center justify-center rounded-3xl bg-[#b94b42] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(185,75,66,0.18)] transition hover:-translate-y-0.5 hover:bg-[#9e3f38]"
                      >
                        Cancelar reporte
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-xl rounded-[1.75rem] border border-[#e0c7b5] bg-white p-6 shadow-[0_25px_80px_rgba(0,0,0,0.22)]">
            <p className="text-xs uppercase tracking-[0.25em] text-[#8b6f54]">Cancelar reporte</p>
            <h3 className="mt-3 text-2xl font-semibold text-[#3e2f23]">{cancelTarget.tipo}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Escribe el motivo de la cancelación. Este dato quedará guardado para seguimiento interno.
            </p>
            <textarea
              value={cancelReason}
              onChange={(event) => {
                setCancelReason(event.target.value);
                if (cancelError) setCancelError('');
              }}
              rows={5}
              className="mt-5 w-full resize-none rounded-3xl border border-[#d7c2aa] bg-[#fff8ef] p-4 text-base text-slate-900 outline-none transition focus:border-[#b76042] focus:ring-4 focus:ring-[#f5d6b6]/60"
              placeholder="Motivo de cancelación"
            />
            <p className="mt-2 text-sm text-slate-500">{cancelReason.trim().length}/500 caracteres</p>
            {cancelError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {cancelError}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCancelDialog}
                disabled={canceling}
                className="rounded-3xl border border-[#d7c2aa] bg-[#fbf6f0] px-5 py-3 text-sm font-semibold text-[#5c4d40] transition hover:border-[#b76042] disabled:opacity-60"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCancelReport}
                disabled={canceling}
                className="rounded-3xl bg-[#b94b42] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(185,75,66,0.18)] transition hover:bg-[#9e3f38] disabled:opacity-60"
              >
                {canceling ? 'Cancelando...' : 'Confirmar cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default WorkerReportsPage;
