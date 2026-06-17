import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  cancelReport,
  completeReport,
  getReportById,
  getReportStatusClasses,
  getReportStatusLabel,
  takeReport,
} from '../services/workerReportsService';

function WorkerReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const loadReport = async () => {
    const reportId = Number(id);

    if (Number.isNaN(reportId)) {
      setError('ID de reporte inválido.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const found = await getReportById(reportId);
      setReport(found);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('workerToken');
        localStorage.removeItem('workerName');
        navigate('/trabajadores/login', { replace: true });
        return;
      }

      setError(err.response?.data?.message || 'Reporte no encontrado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handleTakeReport = async () => {
    try {
      await takeReport(report.id);
      await loadReport();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo tomar el reporte.');
    }
  };

  const handleCompleteReport = async () => {
    try {
      await completeReport(report.id);
      await loadReport();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo completar el reporte.');
    }
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
      await cancelReport(report.id, reason);
      setShowCancelForm(false);
      setCancelReason('');
      await loadReport();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'No se pudo cancelar el reporte.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/95 p-8 shadow-[0_20px_60px_rgba(101,73,46,0.08)] text-slate-600">
        Cargando reporte...
      </section>
    );
  }

  if (error && !report) {
    return (
      <section className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/95 p-8 shadow-[0_20px_60px_rgba(101,73,46,0.08)]">
        <p className="text-base text-[#b76042]">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/trabajadores/panel/reportes')}
          className="mt-6 inline-flex rounded-3xl bg-[#d4752a] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(183,96,66,0.22)] transition hover:bg-[#a6542d]"
        >
          Volver a lista de reportes
        </button>
      </section>
    );
  }

  const statusClasses = getReportStatusClasses(report.estado);
  const statusLabel = getReportStatusLabel(report.estado);

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-[#d7c2aa]/60 bg-white/95 p-8 shadow-[0_20px_60px_rgba(101,73,46,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7d614a]">Detalle del reporte</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#3e2f23]">{report.tipo}</h2>
          </div>
          <div className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${statusClasses}`}>
            {statusLabel}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-[#e8dfd0] bg-[#fff6ec] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7d614a]">Descripción</p>
            <p className="mt-4 text-base leading-7 text-slate-700">{report.descripcion}</p>
          </div>
          <div className="space-y-4 rounded-[1.75rem] border border-[#e8dfd0] bg-[#f7fbff] p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7d614a]">Ciudadano</p>
              <p className="mt-3 text-base leading-7 text-slate-700">{report.ciudadano || 'Anónimo'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7d614a]">Ubicación</p>
              <p className="mt-3 text-base leading-7 text-slate-700">{report.ubicacion}</p>
            </div>
            {report.senas_lugar && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7d614a]">Señas del lugar</p>
                <p className="mt-3 text-base leading-7 text-slate-700">{report.senas_lugar}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7d614a]">Fecha de creación</p>
              <p className="mt-3 text-base leading-7 text-slate-700">{report.fecha || report.fecha_creacion}</p>
            </div>
            {report.estado === 'cancelado' && report.motivo_cancelacion && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7d614a]">Motivo de cancelación</p>
                <p className="mt-3 text-base leading-7 text-red-700">{report.motivo_cancelacion}</p>
              </div>
            )}
          </div>
        </div>

        {showCancelForm && (
          <div className="mt-6 rounded-[1.75rem] border border-[#f0b4a8] bg-[#fff7f5] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#8b4a42]">Cancelar reporte</p>
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
              placeholder="Motivo de cancelación"
              className="mt-5 w-full resize-none rounded-3xl border border-[#d7c2aa] bg-white p-4 text-base text-slate-900 outline-none transition focus:border-[#b76042] focus:ring-4 focus:ring-[#f5d6b6]/60"
            />
            <p className="mt-2 text-sm text-slate-500">{cancelReason.trim().length}/500 caracteres</p>
            {cancelError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {cancelError}
              </div>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (canceling) return;
                  setShowCancelForm(false);
                  setCancelReason('');
                  setCancelError('');
                }}
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
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {report.estado === 'recibido' && (
              <button
                type="button"
                onClick={handleTakeReport}
                className="rounded-3xl bg-[#f6c24c] px-5 py-3 text-sm font-semibold text-[#744f0b] shadow-[0_12px_25px_rgba(182,136,40,0.18)] transition hover:-translate-y-0.5 hover:bg-[#e4b438]"
              >
                Tomar reporte
              </button>
            )}
            {report.estado === 'en_atencion' && (
              <button
                type="button"
                onClick={handleCompleteReport}
                className="rounded-3xl bg-[#4f9c74] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,156,116,0.22)] transition hover:-translate-y-0.5 hover:bg-[#3b7b5c]"
              >
                Marcar como completado
              </button>
            )}
            {(report.estado === 'recibido' || report.estado === 'en_atencion') && (
              <button
                type="button"
                onClick={() => {
                  setShowCancelForm(true);
                  setCancelError('');
                }}
                className="rounded-3xl bg-[#b94b42] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(185,75,66,0.18)] transition hover:-translate-y-0.5 hover:bg-[#9e3f38]"
              >
                Cancelar reporte
              </button>
            )}
          </div>
          <Link
            to="/trabajadores/panel/reportes"
            className="inline-flex items-center justify-center rounded-full border border-[#d7c2aa] bg-[#fbf6f0] px-5 py-3 text-sm font-semibold text-[#5c4d40] transition hover:border-[#b76042] hover:text-[#b76042]"
          >
            Volver a lista de reportes
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WorkerReportDetailPage;
