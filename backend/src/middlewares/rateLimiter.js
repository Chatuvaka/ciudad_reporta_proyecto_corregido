function createRateLimiter({ windowMs, maxRequests, message }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const current = hits.get(key) || [];
    const recent = current.filter((timestamp) => now - timestamp < windowMs);

    if (recent.length >= maxRequests) {
      return res.status(429).json({
        error: true,
        message,
      });
    }

    recent.push(now);
    hits.set(key, recent);

    if (hits.size > 1000) {
      for (const [storedKey, timestamps] of hits.entries()) {
        const active = timestamps.filter((timestamp) => now - timestamp < windowMs);
        if (active.length === 0) hits.delete(storedKey);
        else hits.set(storedKey, active);
      }
    }

    return next();
  };
}

const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Demasiados intentos de inicio de sesion. Intenta nuevamente en unos minutos.',
});

const reportCreateRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 20,
  message: 'Demasiados reportes enviados desde este equipo. Intenta nuevamente en unos minutos.',
});

const workerActionRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 60,
  message: 'Demasiadas acciones en poco tiempo. Espera un momento e intenta nuevamente.',
});

export { loginRateLimiter, reportCreateRateLimiter, workerActionRateLimiter };
