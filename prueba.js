const fs = require('fs');
const path = require('path');
const { generateValidatorFromSchema } = require('./translator');

const validatorPath = path.resolve(__dirname, 'validadorGenerado.js');

function loadJsonFile(filename) {
  const raw = fs.readFileSync(filename, 'utf8');
  return JSON.parse(raw);
}

function loadValidator() {
  delete require.cache[validatorPath];
  return require(validatorPath);
}

function runTest(name, data, expectedOk) {
  const validador = loadValidator();
  const result = validador.safeParse(data);
  const passed = result.success === expectedOk;

  if (passed) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
    if (!result.success) {
      const issues = result.error.issues || result.error.errors || [];
      issues.forEach((issue) => {
        const pathString = Array.isArray(issue.path) ? issue.path.join('.') : '<root>';
        console.log(`  - ${pathString || '<root>'}: ${issue.message}`);
      });
    }
  }
}

function ensureSampleFiles() {
  const samples = [
    {
      filename: 'datosBuenos.json',
      data: {
        usuario: 'roberto_admin',
        nivel: 10,
        activo: true,
        puntos: 500,
      },
    },
    {
      filename: 'datosMalos.json',
      data: {
        usuario: 'hacker_pro',
        nivel: '99',
        activo: 'tal vez',
      },
    },
  ];

  for (const sample of samples) {
    if (!fs.existsSync(sample.filename)) {
      fs.writeFileSync(sample.filename, JSON.stringify(sample.data, null, 2), 'utf8');
    }
  }

  if (!fs.existsSync('datosJsonInvalidos.json')) {
    fs.writeFileSync('datosJsonInvalidos.json', '{ "usuario": "fallido", "nivel": 9, "activo": true, ', 'utf8');
  }
}

function runFileTest(name, filename, expectedOk) {
  try {
    const data = loadJsonFile(filename);
    runTest(`${name} (archivo: ${filename})`, data, expectedOk);
  } catch (error) {
    if (expectedOk) {
      console.log(`❌ ${name} (archivo: ${filename})`);
      console.log(`  - Error al leer el archivo: ${error.message}`);
    } else {
      console.log(`✅ ${name} (archivo: ${filename}) detectó el problema correctamente.`);
      console.log(`  - Mensaje: ${error.message}`);
    }
  }
}

function main() {
  try {
    generateValidatorFromSchema();
    ensureSampleFiles();

    console.log('--- INICIANDO PRUEBAS DE VALIDACIÓN ---\n');

    runTest('Prueba 1: datos buenos en código', {
      usuario: 'roberto_admin',
      nivel: 10,
      activo: true,
      puntos: 500,
    }, true);

    runTest('Prueba 2: datos malos en código', {
      usuario: 'hacker_pro',
      nivel: '99',
      activo: 'tal vez',
    }, false);

    console.log();
    runFileTest('Prueba 3: datos buenos desde archivo', 'datosBuenos.json', true);
    runFileTest('Prueba 4: datos malos desde archivo', 'datosMalos.json', false);
    runFileTest('Prueba 5: archivo JSON malformado', 'datosJsonInvalidos.json', false);

    console.log('\n--- FIN DE PRUEBAS ---');
  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
  }
}

main();

