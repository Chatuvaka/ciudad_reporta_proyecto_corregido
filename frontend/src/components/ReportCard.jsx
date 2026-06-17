import { getReportStatusClasses, getReportStatusLabel } from '../services/workerReportsService';

const TIPO_ICONOS = {
  Bache: '🕳️',
  'Luminaria dañada': '💡',
  'Fuga de agua': '💧',
  'Basura acumulada': '🗑️',
  'Señalización dañada': '🚧',
  'Árbol caído': '🌳',
};

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

function ReportCard({ reporte }) {
  const fecha = formatDate(reporte.fecha || reporte.fecha_creacion);
  const statusLabel = getReportStatusLabel(reporte.estado);
  const statusClasses = getReportStatusClasses(reporte.estado);

  return (
    <article className="rounded-[1.75rem] border border-[#d7c2aa]/70 bg-[#fff9f0]/90 p-6 shadow-[0_18px_45px_rgba(101,73,46,0.11)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(101,73,46,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f3dfc5] text-2xl shadow-inner shadow-[#ffffff90]/80">
            {TIPO_ICONOS[reporte.tipo] || '📌'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#3e2f23] leading-tight">{reporte.tipo}</h3>
            <p className="text-xs uppercase tracking-[0.24em] text-[#8b6f54] mt-1">#{reporte.id} · {fecha}</p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusClasses}`}>
          {statusLabel}
        </span>
      </div>

      <p className="mt-5 text-sm leading-7 text-[#5f4937] min-h-[3.5rem]">{reporte.descripcion}</p>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#e7d8c1] pt-4 text-sm text-[#6d523f]">
        <div className="flex items-center gap-2">
          <span className="text-[#b76042]">📍</span>
          <span>{reporte.ubicacion}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6c8464]">👤</span>
          <span>{reporte.ciudadano || 'Anónimo'}</span>
        </div>
      </div>
    </article>
  );
}

export default ReportCard;
