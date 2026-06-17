import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearWorkerSession, isWorkerTokenValid, loginTrabajador } from '../services/api';

function WorkerLoginPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('workerToken');
    if (isWorkerTokenValid(token)) {
      navigate('/trabajadores/panel', { replace: true });
    } else {
      clearWorkerSession();
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!correo.trim() || !password.trim()) {
      setError('Por favor ingresa correo y contraseña.');
      return;
    }

    try {
      setLoading(true);

      const response = await loginTrabajador({
        correo: correo.trim(),
        password: password.trim(),
      });

      localStorage.setItem('workerToken', response.data.token);
      localStorage.setItem('workerName', response.data.trabajador?.nombre || 'Trabajador');
      localStorage.setItem('workerEmail', response.data.trabajador?.correo || correo.trim());

      navigate('/trabajadores/panel', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Credenciales incorrectas o servidor no disponible.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[80vh] overflow-hidden bg-[#fcf6ee] px-4 py-10 sm:px-6 lg:px-10">
      <div className="absolute -right-10 top-10 h-72 w-72 rounded-full bg-[#f6e7d3]/80 blur-3xl" />
      <div className="absolute left-0 top-24 h-40 w-40 rounded-full bg-[#d6eef4]/35 blur-3xl" />

      <div className="relative mx-auto max-w-3xl rounded-[2rem] border border-[#d7c2aa]/60 bg-white/95 p-8 shadow-[0_20px_60px_rgba(101,73,46,0.08)]">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#7d614a]">Acceso de trabajadores</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#3e2f23] sm:text-5xl">Acceso de trabajadores</h1>
          <p className="mt-4 text-base leading-7 text-slate-700">
            Ingresa con tu cuenta autorizada para ver y gestionar reportes disponibles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Correo</span>
            <input
              type="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-[#d7c2aa] bg-[#fbf5ee] px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-[#b76042] focus:ring-2 focus:ring-[#f5d6b6]/60"
              placeholder="trabajador@sonora.gob.mx"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-[#d7c2aa] bg-[#fbf5ee] px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-[#b76042] focus:ring-2 focus:ring-[#f5d6b6]/60"
              placeholder="••••••"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="rounded-3xl border border-[#f2c0a3] bg-[#fff0e5] p-4 text-sm text-[#8f3f1b]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full justify-center rounded-3xl bg-[#b76042] px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(183,96,66,0.2)] transition hover:-translate-y-0.5 hover:bg-[#a4543b] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default WorkerLoginPage;
