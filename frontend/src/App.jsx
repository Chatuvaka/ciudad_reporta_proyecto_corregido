import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Ayuda from './pages/Ayuda';
import WorkerLoginPage from './pages/WorkerLoginPage';
import WorkerLayout from './pages/WorkerLayout';
import WorkerDashboardPage from './pages/WorkerDashboardPage';
import WorkerReportsPage from './pages/WorkerReportsPage';
import WorkerReportDetailPage from './pages/WorkerReportDetailPage';
import ProtectedWorkerRoute from './components/ProtectedWorkerRoute';

function PublicLayout() {
  return (
    <div className="sonora-page min-h-screen text-slate-900">
      <Navbar />

      <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-10">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#fff5e5] to-transparent opacity-80 pointer-events-none" />
        <div className="relative">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/80 backdrop-blur-xl px-4 py-5 sm:px-6 lg:px-10">
        <div className="mx-auto flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © 2024 Gobierno del Estado de Sonora - Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center gap-3 text-slate-500">
            <a href="#" className="transition hover:text-[#b76042]">Términos</a>
            <span className="text-slate-300">|</span>
            <a href="#" className="transition hover:text-[#b76042]">Privacidad</a>
            <span className="text-slate-300">|</span>
            <a href="#" className="transition hover:text-[#b76042]">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/trabajadores/login" element={<WorkerLoginPage />} />
        <Route
          path="/trabajadores/panel"
          element={
            <ProtectedWorkerRoute>
              <WorkerLayout />
            </ProtectedWorkerRoute>
          }
        >
          <Route index element={<WorkerDashboardPage />} />
          <Route path="reportes" element={<WorkerReportsPage />} />
          <Route path="reportes/:id" element={<WorkerReportDetailPage />} />
        </Route>

        <Route path="/*" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="reportar" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="reportes-recientes" element={<Dashboard />} />
          <Route path="ayuda" element={<Ayuda />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
