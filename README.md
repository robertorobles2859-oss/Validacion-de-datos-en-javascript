Proyecto: Traductor de Esquemas y Analizador Léxico/Sintáctico
Este programa valida datos automáticamente usando Node.js y Zod.

## Analizador Léxico y Sintáctico
Se ha añadido un componente independiente para análisis léxico y sintáctico de un lenguaje simplificado.

Uso:
- Ejecutar: `node analizador.js programaEjemplo.jv`
- Entrada válida: `programaEjemplo.jv`
- Entrada con errores: `programaEjemploInvalido.jv`

El analizador imprime:
- tokens generados
- errores léxicos
- errores sintácticos
- el AST resultante
