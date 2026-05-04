const fs = require('fs');

// Función para mapear tipos de esquema a tipos de Zod
function mapearTipoAZod(tipo) {
  switch (tipo) {
    case 'texto':
      return 'z.string()';
    case 'numero':
      return 'z.number()';
    case 'si_no':
      return 'z.boolean()';
    default:
      return 'z.any()';
  }
}

// Función para cargar el esquema desde un archivo JSON
function cargarEsquema(nombreArchivo = 'esquema.json') {
  const contenidoCrudo = fs.readFileSync(nombreArchivo, 'utf8');
  return JSON.parse(contenidoCrudo);
}

// Función para traducir el esquema a código Zod
function traducirAZod(esquema) {
  let codigo = `const { z } = require('zod');\n\n`;
  codigo += `const validadorPersonalizado = z.object({\n`;

  for (const nombreCampo in esquema) {
    const tipoCampo = esquema[nombreCampo];
    const tipoZod = mapearTipoAZod(tipoCampo);
    codigo += `  ${nombreCampo}: ${tipoZod},\n`;
  }

  codigo += `});\n\nmodule.exports = validadorPersonalizado;\n`;
  return codigo;
}

// Función para escribir el archivo del validador
function escribirArchivoValidador(codigo, nombreArchivo = 'validadorGenerado.js') {
  fs.writeFileSync(nombreArchivo, codigo, 'utf8');
}

// Función principal para generar el validador desde el esquema
function generarValidadorDesdeEsquema(archivoEsquema = 'esquema.json', archivoSalida = 'validadorGenerado.js') {
  const esquema = cargarEsquema(archivoEsquema);
  const codigoValidador = traducirAZod(esquema);
  escribirArchivoValidador(codigoValidador, archivoSalida);
  return archivoSalida;
}

if (require.main === module) {
  try {
    generarValidadorDesdeEsquema();
    console.log("🚀 [ÉXITO]: Esquema leído de 'esquema.json' y traducido a 'validadorGenerado.js'");
  } catch (error) {
    console.error('❌ Error al generar el validador:', error.message);
    process.exit(1);
  }
}

module.exports = {
  cargarEsquema,
  traducirAZod,
  escribirArchivoValidador,
  generarValidadorDesdeEsquema,
};