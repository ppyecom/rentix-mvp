// Envuelve un handler async para que cualquier error rechazado
// pase al middleware de errores de Express (evita requests colgados).
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
