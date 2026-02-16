const { z } = require('zod');

const validadorPersonalizado = z.object({
  usuario: z.string(),
  nivel: z.number(),
  activo: z.boolean(),
  puntos: z.number(),
});

module.exports = validadorPersonalizado;