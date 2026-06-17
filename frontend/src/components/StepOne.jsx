const TIPOS = [
  { value: 'Bache',               icon: 'pothole', desc: 'Un hoyo en la pavimentación' },
  { value: 'Luminaria dañada',    icon: 'lamp', desc: 'Lámpara pública sin funcionar' },
  { value: 'Fuga de agua',        icon: 'water', desc: 'Pérdida de agua en la vía pública' },
  { value: 'Basura acumulada',    icon: 'trash', desc: 'Residuos sin recolectar' },
  { value: 'Señalización dañada', icon: 'sign', desc: 'Señales de tránsito deterioradas' },
  { value: 'Árbol caído',         icon: 'tree', desc: 'Árbol caído en espacio público' },
];

function renderIncidentIcon(name) {
  switch (name) {
    case 'pothole':
      return (
        <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
          <circle cx="32" cy="32" r="24" fill="#6b5a4f" opacity="0.12" />
          <path d="M20 32c2-8 8-10 18-10s16 4 14 12-12 10-18 14-14-2-14-8 0-4 0-8" fill="#6b5a4f" />
          <path d="M24 28l6-4m8 2l8-2m-4 8l6-2" stroke="#40312a" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'lamp':
      return (
        <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
          <path d="M32 12c-9 0-16 7-16 16 0 6 3 11 7 14 1 5 3 10 3 14h12c0-4 2-9 3-14 4-3 7-8 7-14 0-9-7-16-16-16z" fill="#ffecb3" stroke="#f2b850" strokeWidth="2" />
          <path d="M28 44h8v6h-8z" fill="#a97b5d" />
          <path d="M24 50h16v4H24z" fill="#7a5c47" />
        </svg>
      );
    case 'water':
      return (
        <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
          <path d="M32 52s-16-10-16-22a16 16 0 0132 0c0 12-16 22-16 22z" fill="#5fb6e2" />
          <path d="M32 32c-4 4-4 6-4 6s2-2 4-2 4 2 4 2 0-2-4-6z" fill="#72c5e8" opacity="0.8" />
        </svg>
      );
    case 'trash':
      return (
        <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
          <path d="M20 18h24v6H20z" fill="#e0e0e0" />
          <path d="M24 24h16v26H24z" fill="#c9c9c9" />
          <path d="M28 30v14m8-14v14" stroke="#8a8a8a" strokeWidth="3" strokeLinecap="round" />
          <path d="M26 18v-4h12v4" stroke="#8a8a8a" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'sign':
      return (
        <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
          <path d="M24 12h16l12 12-12 12H24l-12-12 12-12z" fill="#f8b250" stroke="#d48a2d" strokeWidth="2" />
          <path d="M32 24v14" stroke="#6b4f2b" strokeWidth="4" strokeLinecap="round" />
          <path d="M32 38v12" stroke="#6b4f2b" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'tree':
      return (
        <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
          <path d="M32 16c-8 0-14 6-14 14 0 4 2 8 5 10H23v8h18v-8h0.1c3-2 5-6 5-10 0-8-6-14-14-14z" fill="#5aa96a" />
          <path d="M29 46h6v10h-6z" fill="#7a5939" />
        </svg>
      );
    default:
      return null;
  }
}

function StepOne({ data, setData, onNext }) {
  const handleNext = () => {
    if (!data.tipo) {
      alert('Por favor selecciona un tipo de incidencia.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6" aria-labelledby="reporta-title">
      <div className="space-y-2 text-center">
        <h2 id="reporta-title" className="a11y-section-title">
          ¿Qué tipo de incidencia reportas?
        </h2>
        <p className="max-w-2xl mx-auto a11y-subtitle">
          Selecciona la categoría que mejor describe el problema.
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {TIPOS.map((tipo) => {
          const selected = data.tipo === tipo.value;
          return (
            <button
              key={tipo.value}
              type="button"
              aria-pressed={selected}
              aria-label={`Seleccionar ${tipo.value}`}
              onClick={() => setData({ ...data, tipo: tipo.value })}
              className={`relative flex flex-col items-start gap-4 overflow-hidden rounded-xl border p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus-visible:shadow-[0_0_0_6px_rgba(201,162,125,0.22)] sm:flex-row sm:gap-6 sm:p-7 a11y-card-large ${
                selected
                  ? 'border-[#3f8f5f] bg-[#f1fbf4] shadow-[0_18px_40px_rgba(63,143,95,0.16)] scale-[1.01]'
                  : 'border-[#d7c2aa] bg-[var(--bg-light)] shadow-[0_8px_20px_rgba(99,70,38,0.04)] hover:border-[var(--border-important)] hover:bg-[#fff5e8] hover:shadow-[0_18px_38px_rgba(212,117,58,0.12)]'
              }`}
            >
              <div className="a11y-icon flex-shrink-0 items-center justify-center rounded-full bg-[#f3dfc5] text-center shadow-inner" aria-hidden>
                {renderIncidentIcon(tipo.icon)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="a11y-card-title">{tipo.value}</p>
                <p className="a11y-card-desc">{tipo.desc}</p>
              </div>

              {selected && (
                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#3f8f5f] text-white shadow-[0_10px_26px_rgba(63,143,95,0.28)] sm:static sm:ml-3 sm:h-11 sm:w-11" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <div className="pointer-events-none absolute -bottom-2 -right-2 opacity-10">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#f3dfc5]" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="currentColor" />
                  <circle cx="12" cy="12" r="5" fill="white" opacity="0.1" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={handleNext}
          aria-label="Siguiente paso"
          className="inline-flex items-center justify-center rounded-full bg-[var(--btn-primary)] px-10 text-[22px] font-extrabold text-white shadow-[0_16px_40px_rgba(183,96,66,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(183,96,66,0.28)] active:translate-y-0.5 focus:outline-none focus-visible:shadow-[0_0_0_6px_rgba(201,162,125,0.18)] a11y-btn-large"
        >
          Siguiente
          <svg className="ml-3 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default StepOne;
