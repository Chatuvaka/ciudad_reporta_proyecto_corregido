import { getReportStatusClasses, getReportStatusLabel } from '../services/workerReportsService';

const TIPO_ICONOS = {
  Bache: (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#6b5a4f]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="7" fill="#d5c4b4" />
      <path d="M9 10c1-2 2-3 4-3s3 1 4 3" />
      <path d="M8 14c1 1.5 2.5 2 4 2s3-0.5 4-2" />
    </svg>
  ),
  'Luminaria dañada': (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#f1b850]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a5 5 0 00-5 5c0 2 1.5 3.5 2.5 4 0 1 0 2 0 3h5c0-1 0-2 0-3 1-.5 2.5-2 2.5-4a5 5 0 00-5-5z" fill="#fbe9a7" />
      <path d="M10 17h4" />
      <path d="M9 20h6" />
    </svg>
  ),
  'Fuga de agua': (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#3b99d9]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4s-4 4-4 8 1.5 6 4 6 4-2.5 4-6-4-8-4-8z" fill="#9ccdec" />
      <path d="M12 12c-1 1-1 2-1 2s0-1 1-2 1-2 1-2 0 1-1 2z" fill="#d7efff" />
    </svg>
  ),
  'Basura acumulada': (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#7a5c47]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 7h10l-1 12H8L7 7z" fill="#d8c1b2" />
      <path d="M9 7V5h6v2" />
      <path d="M10 11v4" />
      <path d="M14 11v4" />
    </svg>
  ),
  'Señalización dañada': (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#d48a2d]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 7-7 7-7-7 7-7z" fill="#f8b250" />
      <path d="M12 10v8" />
    </svg>
  ),
  'Árbol caído': (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#4f9644]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4c-3 0-5 2-5 5 0 2 1 3 2 4v4h6v-4c1-1 2-2 2-4 0-3-2-5-5-5z" fill="#8dc48f" />
      <path d="M9 17h6" />
    </svg>
  ),
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
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fde8d5] text-[#b76042]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2l7 7-7 7-7-7 7-7z" fill="#f8b250" />
              <path d="M12 9v6" />
            </svg>
          </span>
          <span>{reporte.ubicacion}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f6ec] text-[#4f9644]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M6 20c0-3.33 2.67-6 6-6s6 2.67 6 6" />
            </svg>
          </span>
          <span>{reporte.ciudadano || 'Anónimo'}</span>
        </div>
      </div>
    </article>
  );
}

export default ReportCard;
