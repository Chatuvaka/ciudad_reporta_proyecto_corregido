import { useRef, useState } from 'react';
import { crearReporte } from '../services/api';

const TIPO_ICONOS = {
  'Bache': (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#6b5a4f]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="7" fill="#d5c4b4" />
      <path d="M9 10c1-2 2-3 4-3s3 1 4 3" />
      <path d="M8 14c1 1.5 2.5 2 4 2s3-0.5 4-2" />
    </svg>
  ),
  'Luminaria dañada': (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#f1b850]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a5 5 0 00-5 5c0 2 1.5 3.5 2.5 4 0 1 0 2 0 3h5c0-1 0-2 0-3 1-.5 2.5-2 2.5-4a5 5 0 00-5-5z" fill="#fbe9a7" />
      <path d="M10 17h4" />
      <path d="M9 20h6" />
    </svg>
  ),
  'Fuga de agua': (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#3b99d9]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4s-4 4-4 8 1.5 6 4 6 4-2.5 4-6-4-8-4-8z" fill="#9ccdec" />
      <path d="M12 12c-1 1-1 2-1 2s0-1 1-2 1-2 1-2 0 1-1 2z" fill="#d7efff" />
    </svg>
  ),
  'Basura acumulada': (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#7a5c47]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 7h10l-1 12H8L7 7z" fill="#d8c1b2" />
      <path d="M9 7V5h6v2" />
      <path d="M10 11v4" />
      <path d="M14 11v4" />
    </svg>
  ),
  'Señalización dañada': (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#d48a2d]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 7-7 7-7-7 7-7z" fill="#f8b250" />
      <path d="M12 10v8" />
    </svg>
  ),
  'Árbol caído': (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#4f9644]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4c-3 0-5 2-5 5 0 2 1 3 2 4v4h6v-4c1-1 2-2 2-4 0-3-2-5-5-5z" fill="#8dc48f" />
      <path d="M9 17h6" />
    </svg>
  ),
};

function StepThree({ data, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const submittingRef = useRef(false);

  const fechaActual = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const items = [
    { label: 'Tipo de incidencia', value: data.tipo, icon: TIPO_ICONOS[data.tipo] || (
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#7a5c47]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="#d8c1b2" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ) },
    { label: 'Ubicación',          value: data.ubicacion },
    { label: 'Señas del Lugar',    value: data.referencia },
    { label: 'Descripción',        value: data.descripcion },
    { label: 'Ciudadano',          value: data.ciudadano?.trim() || 'Anónimo' },
    { label: 'Fecha de registro',  value: fechaActual },
  ];

  const handleSubmit = async () => {
    if (loading || submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await crearReporte({
        tipo:        data.tipo,
        ubicacion:   data.ubicacion,
        direccion:   data.direccion,
        estado:      data.estado || 'Sonora',
        municipio:   data.municipio || 'San Luis Río Colorado',
        senas_lugar: data.referencia,
        referencia:  data.referencia,
        descripcion: data.descripcion,
        ciudadano:   data.ciudadano?.trim() || 'Anónimo',
      });
      onSuccess(response.data);
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Error al enviar. Intenta de nuevo.';
      setErrorMessage(msg);
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="a11y-section-title">Confirma tu reporte</h2>
        <p className="a11y-subtitle">Revisa la información antes de enviar.</p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-[#d7c2aa]/70 bg-[var(--bg-light)] shadow-[0_25px_60px_rgba(97,72,45,0.1)] backdrop-blur-xl">
        <div className="grid gap-6 p-6 sm:grid-cols-2 sm:gap-6 sm:p-8">
          {items.map((item, index) => (
            <div
              key={index}
              className={`rounded-3xl bg-white/95 p-7 ${index < items.length - 2 ? 'border-b border-[#e4d1b5]/70 sm:border-b-0 sm:border-r' : ''} ${index === items.length - 2 ? 'sm:col-span-2' : ''}`}
            >
              <p className="uppercase tracking-[0.18em] a11y-desc mb-3 text-[var(--text-secondary)]">
                {item.label}
              </p>
              <div className="flex items-center gap-3">
                {item.icon && <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#fff4e3] text-[var(--text-secondary)]">{item.icon}</span>}
                <p className="a11y-body font-semibold text-[var(--text-primary)] leading-7 break-words">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-[1.5rem] border border-[#f2c0a3] bg-[#fff0e5] p-5 text-base font-semibold leading-7 text-[#8f3f1b]">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full border border-[var(--border-important)] bg-[var(--bg-light)] px-10 text-[22px] a11y-btn-large font-semibold text-[var(--text-secondary)] shadow-[0_12px_30px_rgba(98,72,45,0.08)] transition-colors duration-200 hover:border-[var(--border-important)] hover:bg-[#fff5e0] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:shadow-[0_0_0_6px_rgba(201,162,125,0.22)]"
        >
          ← VOLVER
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-[var(--btn-primary)] px-12 text-[22px] a11y-btn-large font-extrabold text-white shadow-[0_18px_45px_rgba(183,96,66,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(183,96,66,0.28)] active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:shadow-[0_0_0_6px_rgba(201,162,125,0.22)]"
        >
          {loading ? 'Enviando reporte...' : 'Enviar reporte'}
        </button>
      </div>
    </div>
  );
}

export default StepThree;
