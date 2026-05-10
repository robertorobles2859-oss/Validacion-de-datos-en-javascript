# Diseño del Analizador Léxico y Sintáctico

## Lenguaje simplificado definido

El lenguaje soportado incluye:
- Palabras reservadas: `var`, `let`, `const`, `int`, `float`, `if`, `else`, `while`, `return`, `print`
- Literales: números (`123`, `3.14`), cadenas (`"texto"`), booleanos (`true`, `false`) y nulo (`null`)
- Identificadores: comienzan con letra o guion bajo y pueden contener letras, dígitos y `_`
- Operadores: `+`, `-`, `*`, `/`, `%`, `=`, `==`, `!=`, `===`, `!==`, `<`, `<=`, `>`, `>=`, `&&`, `||`, `!`, `++`, `--`, `+=`, `-=`
- Separadores y puntuación: `(`, `)`, `{`, `}`, `[`, `]`, `;`, `,`, `.`
- Comentarios de línea: `// comentario`
- Comentarios multilínea: `/* comentario */`
- `print` se usa como llamada de función: `print(...)`.

> Nota: el lexer reconoce otras palabras reservadas como `for` y `function`, pero el parser actual está enfocado en declaraciones `var/let/const`, `if`, `while`, `return`, `print` y expresiones.

## Estructura del analizador

### Analizador léxico (`Lexer`)

- Convierte el texto fuente en una secuencia de tokens.
- Registra errores léxicos al encontrar:
  - caracteres inválidos
  - cadenas sin cerrar
  - comentarios multilínea sin cerrar
- Cada token incluye `type`, `value`, `line` y `column`.

### Analizador sintáctico (`Parser`)

- Consume los tokens producidos por el lexer.
- Construye un AST de tipo `Program` con nodos como:
  - `VariableDeclaration`
  - `IfStatement`
  - `WhileStatement`
  - `PrintStatement`
  - `ExpressionStatement`
  - `BinaryExpression`
  - `UnaryExpression`
  - `Identifier`
  - `Literal`
- Detecta errores sintácticos como:
  - expresiones incompletas
  - operadores mal usados
  - falta de `;` al final de expresiones y declaraciones
  - paréntesis o llaves sin cerrar
- Los errores se almacenan en `parseErrors` y no detienen el análisis.

## Manejo de errores

### Errores léxicos

- Identifica y reporta cada carácter inválido con línea y columna.
- Detecta cadenas que no se cierran antes del final de la línea o del archivo.
- Detecta comentarios multilínea sin cierre.

### Errores sintácticos

- Captura tokens inesperados y genera mensajes claros.
- Recupera el análisis tras un error para seguir procesando el resto del programa.
- Ejemplos:
  - `Expresión esperada.`
  - `Se esperaba ')' después de la expresión.`
  - `Se esperaba ';' después de la declaración.`
