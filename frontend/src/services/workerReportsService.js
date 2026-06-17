import {
  completarReporteTrabajador,
  cancelarReporteTrabajador,
  obtenerReporteTrabajadorPorId,
  obtenerReportesTrabajador,
  tomarReporteTrabajador,
} from './api';

export async function getWorkerReports() {
  const response = await obtenerReportesTrabajador();
  return response.data;
}

export async function getReportById(reportId) {
  const response = await obtenerReporteTrabajadorPorId(reportId);
  return response.data;
}

export async function takeReport(reportId) {
  const response = await tomarReporteTrabajador(reportId);
  return response.data.reporte;
}

export async function completeReport(reportId) {
  const response = await completarReporteTrabajador(reportId);
  return response.data.reporte;
}

export async function cancelReport(reportId, motivo) {
  const response = await cancelarReporteTrabajador(reportId, { motivo });
  return response.data.reporte;
}

export function getReportStatusLabel(status) {
  switch (status) {
    case 'recibido':
    case 'Pendiente':
      return 'Recibido';
    case 'en_atencion':
    case 'En proceso':
      return 'En atención';
    case 'completado':
    case 'Resuelto':
      return 'Completado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
}

export function getReportStatusClasses(status) {
  switch (status) {
    case 'recibido':
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    case 'en_atencion':
    case 'En proceso':
      return 'bg-blue-100 text-blue-700 border border-blue-300';
    case 'completado':
    case 'Resuelto':
      return 'bg-green-100 text-green-700 border border-green-300';
    case 'cancelado':
      return 'bg-red-100 text-red-700 border border-red-300';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-300';
  }
}

export function getReportStatusCardClasses(status) {
  switch (status) {
    case 'recibido':
    case 'Pendiente':
      return 'border-yellow-300 bg-yellow-50/95';
    case 'en_atencion':
    case 'En proceso':
      return 'border-blue-300 bg-blue-50/95';
    case 'completado':
    case 'Resuelto':
      return 'border-green-300 bg-green-50/95';
    case 'cancelado':
      return 'border-red-300 bg-red-50/95';
    default:
      return 'border-slate-300 bg-slate-50/95';
  }
}
