const express = require('express');
const router = express.Router();
const {
  getReportes,
  createReporte,
  loginTrabajador,
  getReportesTrabajador,
  getReporteTrabajadorById,
  tomarReporte,
  completarReporte,
  cancelarReporte,
  verificarTrabajador,
} = require('../controllers/reporteController');
const {
  loginRateLimiter,
  workerActionRateLimiter,
} = require('../middlewares/rateLimiter');

// Rutas públicas
router.get('/reportes', getReportes);
router.post('/reportes', createReporte);

// Login de trabajadores
router.post('/trabajadores/login', loginRateLimiter, loginTrabajador);

// Rutas protegidas del módulo de trabajadores
router.get('/trabajadores/reportes', verificarTrabajador, getReportesTrabajador);
router.get('/trabajadores/reportes/:id', verificarTrabajador, getReporteTrabajadorById);
router.patch('/trabajadores/reportes/:id/tomar', workerActionRateLimiter, verificarTrabajador, tomarReporte);
router.patch('/trabajadores/reportes/:id/completar', workerActionRateLimiter, verificarTrabajador, completarReporte);
router.patch('/trabajadores/reportes/:id/cancelar', workerActionRateLimiter, verificarTrabajador, cancelarReporte);

module.exports = router;
