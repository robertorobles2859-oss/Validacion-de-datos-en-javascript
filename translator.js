const fs = require('fs');

// 1. CARGA DEL FORMATO AMIGABLE: Leemos el archivo JSON externo
const contenidoArchivo = fs.readFileSync('esquema.json', 'utf8');
const esquemaDelUsuario = JSON.parse(contenidoArchivo);

// 2. EL MOTOR DE TRADUCCIÓN (Con soporte para múltiples tipos)
function traducirAZod(esquema) {
    let codigoGenerado = `const { z } = require('zod');\n\n`;
    codigoGenerado += `const validadorPersonalizado = z.object({\n`;

    for (const campo in esquema) {
        const tipoOriginal = esquema[campo];
        let tipoZod;

        switch (tipoOriginal) {
            case "texto": tipoZod = "z.string()"; break;
            case "numero": tipoZod = "z.number()"; break;
            case "si_no": tipoZod = "z.boolean()"; break;
            default: tipoZod = "z.any()";
        }

        codigoGenerado += `  ${campo}: ${tipoZod},\n`;
    }

    codigoGenerado += `});\n\nmodule.exports = validadorPersonalizado;`;
    return codigoGenerado;
}

// 3. GENERACIÓN
const resultado = traducirAZod(esquemaDelUsuario);
fs.writeFileSync('validadorGenerado.js', resultado);

console.log("🚀 [ÉXITO]: Esquema leído de 'esquema.json' y traducido a 'validadorGenerado.js'");