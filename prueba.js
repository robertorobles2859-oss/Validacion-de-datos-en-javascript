const fs = require('fs');
const path = require('path');
const { generarValidadorDesdeEsquema } = require('./translator');

const rutaValidador = path.resolve(__dirname, 'validadorGenerado.js');

function cargarArchivoJson(nombreArchivo) {
  const contenidoCrudo = fs.readFileSync(nombreArchivo, 'utf8');
  return JSON.parse(contenidoCrudo);
}

function cargarValidador() {
  delete require.cache[rutaValidador];
  return require(rutaValidador);
}

function ejecutarPrueba(nombre, datos, esperadoCorrecto) {
  const validador = cargarValidador();
  const resultado = validador.safeParse(datos);
  const paso = resultado.success === esperadoCorrecto;

  if (paso) {
    console.log(`✅ ${nombre}`);
  } else {
    console.log(`❌ ${nombre}`);
    if (!resultado.success) {
      const problemas = resultado.error.issues || resultado.error.errors || [];
      problemas.forEach((problema) => {
        const rutaCadena = Array.isArray(problema.path) ? problema.path.join('.') : '<root>';
        console.log(`  - ${rutaCadena || '<root>'}: ${problema.message}`);
      });
    }
  }
}

function asegurarArchivosMuestra() {
  const muestras = [
    {
      nombreArchivo: 'datosBuenos.json',
      datos: {
        usuario: 'roberto_admin',
        nivel: 10,
        activo: true,
        puntos: 500,
      },
    },
    {
      nombreArchivo: 'datosMalos.json',
      datos: {
        usuario: 'hacker_pro',
        nivel: '99',
        activo: 'tal vez',
      },
    },
  ];

  for (const muestra of muestras) {
    if (!fs.existsSync(muestra.nombreArchivo)) {
      fs.writeFileSync(muestra.nombreArchivo, JSON.stringify(muestra.datos, null, 2), 'utf8');
    }
  }

  if (!fs.existsSync('datosJsonInvalidos.json')) {
    fs.writeFileSync('datosJsonInvalidos.json', '{ "usuario": "fallido", "nivel": 9, "activo": true, ', 'utf8');
  }
}

function ejecutarPruebaArchivo(nombre, nombreArchivo, esperadoCorrecto) {
  try {
    const datos = cargarArchivoJson(nombreArchivo);
    ejecutarPrueba(`${nombre} (archivo: ${nombreArchivo})`, datos, esperadoCorrecto);
  } catch (error) {
    if (esperadoCorrecto) {
      console.log(`❌ ${nombre} (archivo: ${nombreArchivo})`);
      console.log(`  - Error al leer el archivo: ${error.message}`);
    } else {
      console.log(`✅ ${nombre} (archivo: ${nombreArchivo}) detectó el problema correctamente.`);
      console.log(`  - Mensaje: ${error.message}`);
    }
  }
}

function principal() {
  try {
    generarValidadorDesdeEsquema();
    asegurarArchivosMuestra();

    console.log('--- INICIANDO PRUEBAS DE VALIDACIÓN ---\n');

    ejecutarPrueba('Prueba 1: datos buenos en código', {
      usuario: 'roberto_admin',
      nivel: 10,
      activo: true,
      puntos: 500,
    }, true);

    ejecutarPrueba('Prueba 2: datos malos en código', {
      usuario: 'hacker_pro',
      nivel: '99',
      activo: 'tal vez',
    }, false);

    console.log();
    ejecutarPruebaArchivo('Prueba 3: datos buenos desde archivo', 'datosBuenos.json', true);
    ejecutarPruebaArchivo('Prueba 4: datos malos desde archivo', 'datosMalos.json', false);
    ejecutarPruebaArchivo('Prueba 5: archivo JSON malformado', 'datosJsonInvalidos.json', false);

    console.log('\n--- FIN DE PRUEBAS ---');
  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
  }
}

principal();

