const ITEMS = [
  { step: 1, label: 'Tipo de incidencia' },
  { step: 2, label: 'Información del reporte' },
  { step: 3, label: 'Confirmación' },
];

function Breadcrumb({ currentStep, onNavigate }) {
  const visibleItems = ITEMS.filter((item) => item.step <= currentStep);

  return (
    <nav className="w-full" aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-[#6d523f] sm:text-base">
        {visibleItems.map((item, index) => {
          const isCurrent = item.step === currentStep;

          return (
            <li key={item.step} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true" className="text-[#c9a27d]">/</span>}
              {isCurrent ? (
                <span aria-current="page" className="rounded-full bg-[#f8dfc9] px-4 py-2 text-[#9a4f35]">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(item.step)}
                  className="rounded-full px-4 py-2 text-[#6d523f] transition hover:bg-[#fff5e3] hover:text-[#9a4f35] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#f5d6b6]/70"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
