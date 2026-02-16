// prueba.js
const validador = require('./validadorGenerado.js');

// CASO 1: Datos Correctos
const datosBuenos = {
    usuario: "roberto_admin",
    nivel: 10,
    activo: true,
    puntos: 500 // <--- Nuevo campo
};

// CASO 2: Datos Incorrectos (El nivel es un texto "99" en vez de un número)
const datosMalos = {
    usuario: "hacker_pro",
    nivel: 99, 
    activo: "tal vez" // Esto causará un error porque no es true ni false
};

console.log("--- INICIANDO PRUEBAS DE VALIDACIÓN ---");

// Probar datos buenos
try {
    validador.parse(datosBuenos);
    console.log("✅ Prueba 1: Datos válidos aceptados correctamente.");
} catch (error) {
    console.log("❌ Prueba 1: Error inesperado.");
}

// Probar datos malos
try {
    validador.parse(datosMalos);
    console.log("❌ Prueba 2: ¡Error! Se aceptaron datos inválidos.");
} catch (error) {
    console.log("✅ Prueba 2: El validador detectó el error de tipo con éxito.");
    // Esto imprimirá el error de forma más sencilla
    console.log("Detalles del error detectado:", error.message);
}