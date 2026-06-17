import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import StepOne   from '../components/StepOne';
import StepTwo   from '../components/StepTwo';
import StepThree from '../components/StepThree';

const INITIAL = {
  tipo: '',
  direccion: '',
  referencia: '',
  ubicacion: '',
  descripcion: '',
  ciudadano: '',
};

function Home() {
  const [step, setStep]       = useState(1);
  const [data, setData]       = useState(INITIAL);
  const [success, setSuccess] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const navigate              = useNavigate();

  const reset = () => {
    setStep(1);
    setData(INITIAL);
    setSuccess(false);
    setSubmittedReport(null);
  };

  const handleSuccess = (report) => {
    setSubmittedReport(report);
    setSuccess(true);
  };

  /* ── Pantalla de éxito ───────────────────────────────────── */
  if (success) {
    return (
      <main className="relative min-h-[80vh] overflow-hidden px-4 py-12 sm:px-6 lg:px-10" aria-live="polite">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(255,236,205,0.45),_transparent_28%)] pointer-events-none" />
        <div className="relative mx-auto flex min-h-[70vh] w-full max-w-5xl items-center px-4">
          <div className="glass-panel w-full p-6 text-center sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#dff3e7] text-4xl text-[#2f7a55] shadow-inner">
              ✓
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[#7d614a]">Reporte ciudadano</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#3e2f23] sm:text-5xl">
              Reporte enviado
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#5f4937]">
              Tu reporte fue registrado correctamente y ya aparece en la pestaña de seguimiento.
            </p>

            <div className="mx-auto mt-8 grid max-w-3xl gap-4 rounded-[1.5rem] border border-[#e5d3b8] bg-white/90 p-5 text-left sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b6f54]">Folio</p>
                <p className="mt-2 text-2xl font-black text-[#3e2f23]">
                  #{submittedReport?.id || 'Registrado'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b6f54]">Estado inicial</p>
                <p className="mt-2 text-2xl font-black text-[#3e2f23]">En proceso</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-[var(--btn-primary)] px-8 text-base font-extrabold text-white shadow-[0_18px_45px_rgba(183,96,66,0.24)] transition-all duration-200 hover:-translate-y-0.5"
              >
                Ver seguimiento
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[var(--border-important)] bg-[var(--bg-light)] px-8 text-base font-bold text-[var(--text-secondary)] shadow-[0_12px_30px_rgba(98,72,45,0.08)] transition-colors duration-200 hover:bg-[#fff5e3]"
              >
                Crear otro reporte
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── Wizard ──────────────────────────────────────────────── */
  return (
    <main id="main-reporta" aria-labelledby="reporta-title" className="relative min-h-[80vh] overflow-hidden px-4 py-12 sm:px-6 lg:px-10">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(255,236,205,0.45),_transparent_28%)] pointer-events-none" />
      <div className="relative mx-auto w-full max-w-7xl px-4">
        <div className="text-center mx-auto max-w-4xl">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-important)] bg-[var(--bg-light)] px-4 py-2 a11y-subtitle uppercase tracking-[0.22em] text-[var(--text-secondary)]">
            Portal ciudadano
          </div>
          <h1 id="reporta-title" className="mt-6 a11y-title text-center text-[var(--text-primary)]">
            REPORTA UNA INCIDENCIA
          </h1>
          <p className="mt-4 mx-auto text-center a11y-subtitle text-[var(--text-secondary)]">
            Completa los pasos para registrar un problema en tu ciudad.
          </p>
          <div className="mt-6">
            <Breadcrumb currentStep={step} onNavigate={setStep} />
          </div>
        </div>

        <div className="mt-8 glass-panel p-6" role="region" aria-labelledby="reporta-title">
          {step === 1 && (
            <StepOne data={data} setData={setData} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <StepTwo
              data={data} setData={setData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepThree
              data={data}
              onBack={() => setStep(2)}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default Home;
