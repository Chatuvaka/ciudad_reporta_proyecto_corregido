function Ayuda() {
  return (
    <main className="relative min-h-[80vh] overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
      <div className="absolute -right-10 top-10 h-72 w-72 rounded-full bg-[#f6e7d3]/80 blur-3xl" />
      <div className="absolute left-0 top-24 h-40 w-40 rounded-full bg-[#d6eef4]/35 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-[#d7c2aa]/60 bg-[#fff8ef]/95 p-8 shadow-[0_20px_60px_rgba(101,73,46,0.1)] backdrop-blur-xl">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-[#7d614a]">Centro de ayuda</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Centro de ayuda
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg">
              Aquí encontrarás instrucciones claras para levantar un reporte ciudadano correctamente, sin necesidad de iniciar sesión. La plataforma está diseñada para apoyar a la comunidad en el registro de incidencias urbanas.
            </p>
          </div>
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <article className="rounded-[1.75rem] border border-[#d7c2aa]/60 bg-white/90 p-6 shadow-[0_20px_50px_rgba(101,73,46,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(101,73,46,0.14)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#fbe9d1] text-2xl shadow-inner shadow-[#ffffff80]/50">
              📌
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[#3e2f23]">¿Cómo levantar un reporte?</h2>
            <p className="mt-3 text-sm leading-7 text-[#6d523f]">
              Sigue estos pasos sencillos para describir el problema con precisión y facilitar su atención.
            </p>
            <ol className="mt-5 space-y-4 text-sm text-[#5b493a]">
              <li className="flex gap-3"><span className="font-semibold text-[#b76042]">1.</span> Selecciona el tipo de incidencia.</li>
              <li className="flex gap-3"><span className="font-semibold text-[#b76042]">2.</span> Completa la descripción con datos claros.</li>
              <li className="flex gap-3"><span className="font-semibold text-[#b76042]">3.</span> Describe el problema de forma clara.</li>
              <li className="flex gap-3"><span className="font-semibold text-[#b76042]">4.</span> Agrega una ubicación o referencia cercana.</li>
              <li className="flex gap-3"><span className="font-semibold text-[#b76042]">5.</span> Envía el reporte.</li>
            </ol>
          </article>

          <article className="rounded-[1.75rem] border border-[#d7c2aa]/60 bg-white/90 p-6 shadow-[0_20px_50px_rgba(101,73,46,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(101,73,46,0.14)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#d6eef4] text-2xl shadow-inner shadow-[#ffffff80]/50">
              🛠️
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">¿Qué puedo reportar?</h2>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Estas son las incidencias principales que puedes registrar en la plataforma.
            </p>
            <ul className="mt-5 space-y-3 text-base text-slate-700">
              <li>• Bache.</li>
              <li>• Luminaria dañada.</li>
              <li>• Fuga de agua.</li>
              <li>• Basura acumulada.</li>
              <li>• Señalización dañada.</li>
              <li>• Árbol caído.</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-[#d7c2aa]/60 bg-white/90 p-6 shadow-[0_20px_50px_rgba(101,73,46,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(101,73,46,0.14)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#f0e0ff] text-2xl shadow-inner shadow-[#ffffff80]/50">
              💡
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[#3e2f23]">Recomendaciones para un buen reporte</h2>
            <p className="mt-3 text-sm leading-7 text-[#6d523f]">
              Una buena descripción ayuda a canalizar el problema más rápido y con mayor claridad.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[#5b493a]">
              <li>• Escribir una descripción clara.</li>
              <li>• Agregar referencias cercanas.</li>
              <li>• Revisar que los datos estén completos.</li>
              <li>• Agregar evidencia visual si la plataforma lo permite.</li>
            </ul>
          </article>
        </div>

        <section className="mt-10 rounded-[2rem] border border-[#d7c2aa]/60 bg-[#fffdf8]/95 p-8 shadow-[0_20px_60px_rgba(101,73,46,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#7d614a]">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-semibold text-[#3e2f23]">Resuelve tus dudas rápido</h2>
            </div>
            <div className="rounded-3xl bg-[#f8efe0] px-4 py-3 text-sm text-[#5d4b3e] shadow-inner shadow-[#ffffff80]/50">
              Sin login · Sin cuentas · Solo reportes ciudadanos
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <details className="rounded-[1.5rem] border border-[#e5d3b8] bg-white p-5 shadow-[0_15px_35px_rgba(101,73,46,0.05)]">
              <summary className="cursor-pointer font-semibold text-[#3e2f23]">¿Necesito crear una cuenta para reportar?</summary>
              <p className="mt-3 text-base leading-7 text-slate-700">No, puedes enviar un reporte sin iniciar sesión.</p>
            </details>
            <details className="rounded-[1.5rem] border border-[#e5d3b8] bg-white p-5 shadow-[0_15px_35px_rgba(101,73,46,0.05)]">
              <summary className="cursor-pointer font-semibold text-[#3e2f23]">¿Qué datos debo proporcionar?</summary>
              <p className="mt-3 text-base leading-7 text-slate-700">Tipo de incidencia, descripción y ubicación.</p>
            </details>
            <details className="rounded-[1.5rem] border border-[#e5d3b8] bg-white p-5 shadow-[0_15px_35px_rgba(101,73,46,0.05)]">
              <summary className="cursor-pointer font-semibold text-[#3e2f23]">¿Qué hago si no sé la dirección exacta?</summary>
              <p className="mt-3 text-base leading-7 text-slate-700">Puedes escribir referencias cercanas como calles, colonia, parque, escuela o negocio cercano.</p>
            </details>
          </div>
        </section>

      </div>
    </main>
  );
}

export default Ayuda;
