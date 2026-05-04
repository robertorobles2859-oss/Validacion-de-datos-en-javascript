const fs = require('fs');
const path = require('path');
const { generateValidatorFromSchema } = require('./translator');

const schemaFile = process.argv[2] || 'esquema.json';
const dataFile = process.argv[3];

function loadJsonFile(filename) {
  const raw = fs.readFileSync(filename, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`No se pudo leer JSON desde '${filename}': ${error.message}`);
  }
}

function validateData(data) {
  generateValidatorFromSchema(schemaFile);
  const validatorPath = path.resolve(__dirname, 'validadorGenerado.js');
  delete require.cache[validatorPath];
  const validador = require(validatorPath);
  return validador.safeParse(data);
}

function getValidationIssues(result) {
  if (!result.error) {
    return [];
  }
  return result.error.issues || result.error.errors || [];
}

function printValidationResult(result) {
  if (result.success) {
    console.log('✅ Validación correcta: los datos cumplen el esquema.');
    return;
  }

  console.error('❌ Error de validación: los datos NO cumplen el esquema.');
  for (const issue of getValidationIssues(result)) {
    const pathString = Array.isArray(issue.path) ? issue.path.join('.') : '<root>';
    console.error(`  - ${pathString || '<root>'}: ${issue.message}`);
  }
}

function printUsage() {
  console.log('Uso: node app.js [archivoEsquema.json] [archivoDatos.json]');
  console.log('Si no se indica archivo de datos, se ejecutan pruebas internas con datos buenos y malos.');
}

if (require.main === module) {
  try {
    if (dataFile) {
      const data = loadJsonFile(dataFile);
      const result = validateData(data);
      printValidationResult(result);
      process.exit(result.success ? 0 : 1);
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
    printValidationResult(validateData(datosBuenos));

    console.log('\nPrueba 2: datos malos');
    printValidationResult(validateData(datosMalos));

    console.log('\nPuedes validar un archivo con: node app.js esquema.json datosBuenos.json');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
