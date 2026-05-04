const fs = require('fs');
const path = require('path');
const { generarValidadorDesdeEsquema } = require('./translator');

const archivoEsquema = process.argv[2] || 'esquema.json';
const archivoDatos = process.argv[3];

function cargarArchivoJson(nombreArchivo) {
  const contenidoCrudo = fs.readFileSync(nombreArchivo, 'utf8');
  try {
    return JSON.parse(contenidoCrudo);
  } catch (error) {
    throw new Error(`No se pudo leer JSON desde '${nombreArchivo}': ${error.message}`);
  }
}

function validarDatos(datos) {
  generarValidadorDesdeEsquema(archivoEsquema);
  const rutaValidador = path.resolve(__dirname, 'validadorGenerado.js');
  delete require.cache[rutaValidador];
  const validador = require(rutaValidador);
  return validador.safeParse(datos);
}

function obtenerProblemasValidacion(resultado) {
  if (!resultado.error) {
    return [];
  }
  return resultado.error.issues || resultado.error.errors || [];
}

function imprimirResultadoValidacion(resultado) {
  if (resultado.success) {
    console.log('✅ Validación correcta: los datos cumplen el esquema.');
    return;
  }

  console.error('❌ Error de validación: los datos NO cumplen el esquema.');
  for (const problema of obtenerProblemasValidacion(resultado)) {
    const rutaCadena = Array.isArray(problema.path) ? problema.path.join('.') : '<root>';
    console.error(`  - ${rutaCadena || '<root>'}: ${problema.message}`);
  }
}

function imprimirUso() {
  console.log('Uso: node app.js [archivoEsquema.json] [archivoDatos.json]');
  console.log('Si no se indica archivo de datos, se ejecutan pruebas internas con datos buenos y malos.');
}

if (require.main === module) {
  try {
    if (archivoDatos) {
      const datos = cargarArchivoJson(archivoDatos);
      const resultado = validarDatos(datos);
      imprimirResultadoValidacion(resultado);
      process.exit(resultado.success ? 0 : 1);
    }

    console.log('=== VALIDACIÓN POR DEFECTO ===');
    const datosBuenos = {
      usuario: 'roberto_admin',
      nivel: 10,
      activo: true,
      puntos: 500,
    };

    const datosMalos = {
      usuario: 'hacker_pro',
      nivel: '99',
      activo: 'tal vez',
    };

    console.log('\nPrueba 1: datos buenos');
    imprimirResultadoValidacion(validarDatos(datosBuenos));

    console.log('\nPrueba 2: datos malos');
    imprimirResultadoValidacion(validarDatos(datosMalos));

    console.log('\nPuedes validar un archivo con: node app.js esquema.json datosBuenos.json');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
