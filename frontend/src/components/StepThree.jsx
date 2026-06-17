import { useRef, useState } from 'react';
import { crearReporte } from '../services/api';

const TIPO_ICONOS = {
  'Bache':               '🕳️',
  'Luminaria dañada':    '💡',
  'Fuga de agua':        '💧',
  'Basura acumulada':    '🗑️',
  'Señalización dañada': '🚧',
  'Árbol caído':         '🌳',
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
    { label: 'Tipo de incidencia', value: `${TIPO_ICONOS[data.tipo] || '📌'} ${data.tipo}` },
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
              <p className="a11y-body font-semibold text-[var(--text-primary)] leading-7 break-words">
                {item.value}
              </p>
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
