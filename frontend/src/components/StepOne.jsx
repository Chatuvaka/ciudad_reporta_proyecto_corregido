const TIPOS = [
  { value: 'Bache',               icon: '🕳️', desc: 'Un hoyo en la pavimentación' },
  { value: 'Luminaria dañada',    icon: '💡', desc: 'Lámpara pública sin funcionar' },
  { value: 'Fuga de agua',        icon: '💧', desc: 'Pérdida de agua en la vía pública' },
  { value: 'Basura acumulada',    icon: '🗑️', desc: 'Residuos sin recolectar' },
  { value: 'Señalización dañada', icon: '🚧', desc: 'Señales de tránsito deterioradas' },
  { value: 'Árbol caído',         icon: '🌳', desc: 'Árbol caído en espacio público' },
];

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
                <span className="a11y-emoji">{tipo.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="a11y-card-title">{tipo.value}</p>
                <p className="a11y-card-desc">{tipo.desc}</p>
              </div>

              {selected && (
                <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#3f8f5f] text-white shadow-[0_10px_26px_rgba(63,143,95,0.28)] sm:static sm:ml-3 sm:h-11 sm:w-11" aria-hidden>
                  <span style={{fontSize: '20px', fontWeight:800}}>✓</span>
                </div>
              )}

              <div className="pointer-events-none absolute -bottom-2 -right-2 opacity-20">
                <span className="corner-cactus">🌵</span>
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
          <span className="ml-3 text-xl">→</span>
        </button>
      </div>
    </div>
  );
}

export default StepOne;
