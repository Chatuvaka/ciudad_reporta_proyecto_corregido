import { useState } from 'react';
import { validarUbicacionReporte } from '../services/locationValidator';

function StepTwo({ data, setData, onNext, onBack }) {
  const [errorUbicacion, setErrorUbicacion] = useState('');
  const [validating, setValidating] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const hasValue = (value) => String(value || '').trim().length > 0;

  const updateField = (field, value) => {
    setData({ ...data, [field]: value });

    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }

    if ((field === 'direccion' || field === 'referencia') && errorUbicacion) {
      setErrorUbicacion('');
    }
  };

  const getVisualErrors = () => {
    const errors = {};

    if (!hasValue(data.direccion)) {
      errors.direccion = 'La ubicación es obligatoria.';
    }

    if (!hasValue(data.referencia)) {
      errors.referencia = 'Agrega señas del lugar para ubicar mejor el problema.';
    }

    if (!hasValue(data.descripcion)) {
      errors.descripcion = 'La descripción del problema es obligatoria.';
    }

    return errors;
  };

  const handleNext = () => {
    if (validating) return;

    setShowValidation(true);
    setErrorUbicacion('');

    const visualErrors = getVisualErrors();
    setFieldErrors(visualErrors);

    if (Object.keys(visualErrors).length > 0) return;

    setValidating(true);

    setTimeout(() => {
      const direccion = String(data.direccion || '').trim();
      const referencia = String(data.referencia || '').trim();
      const estado = 'Sonora';
      const municipio = 'San Luis Río Colorado';
      const ubicacion = [direccion, municipio, estado, referencia].filter(Boolean).join(', ');

      const res = validarUbicacionReporte({
        direccion: [direccion, referencia].filter(Boolean).join(', '),
        referencia,
        estado,
        municipio,
        ubicacion,
      });

      if (!res.valid) {
        setErrorUbicacion(res.message);
        setFieldErrors((current) => ({
          ...current,
          direccion: res.message,
        }));
        setValidating(false);
        return;
      }

      setData({
        ...data,
        direccion,
        referencia,
        estado,
        municipio,
        ubicacion,
      });

      setFieldErrors({});
      setValidating(false);
      onNext();
    }, 200);
  };

  const field = (label, required, children, help) => (
    <div className="space-y-3">
      <label className="block a11y-body font-semibold text-[var(--text-secondary)]">
        {label}{' '}
        {required ? <span className="text-[#bf5a2f]">*</span> : <span className="text-[#8f6f52] a11y-desc">(opcional)</span>}
      </label>
      {children}
      {help && <p className="a11y-desc text-[var(--text-aux)]">{help}</p>}
    </div>
  );

  const inputBaseClass =
    'w-full rounded-3xl border bg-[var(--bg-light)] px-4 text-[22px] a11y-input-large text-[var(--text-primary)] placeholder:text-[20px] placeholder:text-[#7d614a] min-h-[68px] ' +
    'shadow-[0_12px_30px_rgba(98,72,45,0.08)] transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70';

  const inputClass = (fieldName, extra = '') => {
    const isInvalid = showValidation && Boolean(fieldErrors[fieldName]);
    const stateClass = isInvalid
      ? 'border-red-500 bg-red-50/70 focus:border-red-500 focus:ring-red-500/20'
      : 'border-[#c9a27d] focus:border-[var(--border-important)] focus:ring-[rgba(201,162,125,0.12)]';

    return `${inputBaseClass} ${stateClass} ${extra}`;
  };

  const fieldError = (fieldName) => (
    showValidation && fieldErrors[fieldName] ? (
      <p role="alert" className="mt-2 text-[18px] font-semibold leading-snug text-red-700">
        {fieldErrors[fieldName]}
      </p>
    ) : null
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="a11y-section-title">Información del reporte</h2>
        <p className="a11y-subtitle">Proporciona los detalles del problema encontrado.</p>
      </div>

      <div className="grid gap-6">
        {field(
          'Ubicación',
          true,
          <>
            <input
              type="text"
              placeholder="Calle, colonia, cruce o punto de referencia"
              value={data.direccion || ''}
              onChange={(e) => updateField('direccion', e.target.value)}
              className={inputClass('direccion')}
              aria-invalid={showValidation && fieldErrors.direccion ? 'true' : 'false'}
              aria-describedby={errorUbicacion ? 'ubic-error' : 'ubic-help'}
            />
            {fieldError('direccion')}
            {errorUbicacion && (
              <p id="ubic-error" role="alert" className="mt-3 text-[#7a2f24] text-[20px] font-semibold leading-snug">
                {errorUbicacion}
              </p>
            )}
          </>,
          'Ejemplo: Calle 20 #123, Colonia Comercial.'
        )}

        {field(
          'Señas del Lugar',
          true,
          <>
            <input
              type="text"
              placeholder="Ej. frente a la plaza, esquina con avenida principal"
              value={data.referencia || ''}
              onChange={(e) => updateField('referencia', e.target.value)}
              className={inputClass('referencia')}
              aria-invalid={showValidation && fieldErrors.referencia ? 'true' : 'false'}
            />
            {fieldError('referencia')}
          </>,
          'Agrega una referencia visible para que el equipo ubique la incidencia.'
        )}

        {field(
          'Descripción del Problema',
          true,
          <>
            <textarea
              placeholder="Describe el problema con el mayor detalle posible..."
              value={data.descripcion || ''}
              onChange={(e) => updateField('descripcion', e.target.value)}
              rows={6}
              className={inputClass('descripcion', 'resize-none min-h-[190px] a11y-input-large')}
              aria-invalid={showValidation && fieldErrors.descripcion ? 'true' : 'false'}
            />
            {fieldError('descripcion')}
          </>,
          'Incluye detalles como tamaño, riesgo, horario o condiciones observadas.'
        )}

        {field(
          'Nombre del ciudadano',
          false,
          <input
            type="text"
            placeholder="Tu nombre (vacío = Anónimo)"
            value={data.ciudadano || ''}
            onChange={(e) => updateField('ciudadano', e.target.value)}
            className={inputClass('ciudadano')}
          />,
          'Opcional: agrega tu nombre si deseas seguimiento personalizado.'
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-full border border-[var(--border-important)] bg-[var(--bg-light)] px-8 text-[22px] a11y-btn-large font-semibold text-[var(--text-secondary)] shadow-[0_12px_30px_rgba(98,72,45,0.08)] transition-colors duration-200 hover:border-[var(--border-important)] hover:bg-[#fff5e3] focus:outline-none focus-visible:shadow-[0_0_0_6px_rgba(201,162,125,0.22)]"
        >
          ← VOLVER
        </button>
        <button
          onClick={handleNext}
          disabled={validating}
          aria-busy={validating}
          className={`inline-flex items-center justify-center rounded-full bg-[var(--btn-primary)] px-12 text-[22px] a11y-btn-large font-extrabold text-white shadow-[0_18px_45px_rgba(183,96,66,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(183,96,66,0.28)] active:translate-y-0.5 focus:outline-none focus-visible:shadow-[0_0_0_6px_rgba(201,162,125,0.22)] ${validating ? 'opacity-80 cursor-wait' : ''}`}
        >
          {validating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Validando...
            </>
          ) : (
            'SIGUIENTE'
          )}
        </button>
      </div>
    </div>
  );
}

export default StepTwo;
