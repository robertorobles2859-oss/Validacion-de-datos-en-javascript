const fs = require('fs');

function mapTypeToZod(type) {
  switch (type) {
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

function loadSchema(filename = 'esquema.json') {
  const raw = fs.readFileSync(filename, 'utf8');
  return JSON.parse(raw);
}

function translateToZod(schema) {
  let code = `const { z } = require('zod');\n\n`;
  code += `const validadorPersonalizado = z.object({\n`;

  for (const fieldName in schema) {
    const fieldType = schema[fieldName];
    const zodType = mapTypeToZod(fieldType);
    code += `  ${fieldName}: ${zodType},\n`;
  }

  code += `});\n\nmodule.exports = validadorPersonalizado;\n`;
  return code;
}

function writeValidatorFile(code, filename = 'validadorGenerado.js') {
  fs.writeFileSync(filename, code, 'utf8');
}

function generateValidatorFromSchema(schemaFile = 'esquema.json', outputFile = 'validadorGenerado.js') {
  const schema = loadSchema(schemaFile);
  const validatorCode = translateToZod(schema);
  writeValidatorFile(validatorCode, outputFile);
  return outputFile;
}

if (require.main === module) {
  try {
    generateValidatorFromSchema();
    console.log("🚀 [ÉXITO]: Esquema leído de 'esquema.json' y traducido a 'validadorGenerado.js'");
  } catch (error) {
    console.error('❌ Error al generar el validador:', error.message);
    process.exit(1);
  }
}

module.exports = {
  loadSchema,
  translateToZod,
  writeValidatorFile,
  generateValidatorFromSchema,
};