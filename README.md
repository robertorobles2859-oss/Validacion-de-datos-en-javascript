# Javisa — Analizador, Validador y Traductor de Esquemas

Una pequeña herramienta en Node.js para analizar, validar y traducir programas/esquemas en un lenguaje educativo (.jv). Incluye un analizador léxico/sintáctico, validadores basados en Zod y utilidades de traducción/transformación.

## Tabla de contenidos
- Descripción
- Características
- Requisitos
- Instalación rápida
- Uso (comandos comunes)
- Estructura del repositorio
- Ejemplos
- Contribuir
- Licencia

## Descripción
Javisa valida automáticamente datos y archivos fuente escritos en un lenguaje simplificado (.jv). Está pensado como proyecto educativo y de prototipado para experimentar con análisis léxico/sintáctico, generación de AST y validación con esquemas JSON (Zod).

## Características
- Analizador léxico y sintáctico para `.jv` con reporte de tokens y errores.
- Validación de datos usando esquemas (archivo `esquema.json` y Zod en `validadorGenerado.js`).
- Traductor/transformador simple (`translator.js`).
- Ejemplos de entrada buenos y malos incluidos para pruebas.

## Requisitos
- Node.js 16+ (recomendado)
- npm (para instalar dependencias si las hay)

## Instalación rápida
Clona el repositorio y entra en la carpeta del proyecto:

```bash
git clone <TU_REPO_URL>
cd javisa
npm install
```

(Actualmente el proyecto funciona con scripts Node.js sin dependencias externas obligatorias, pero mantener `npm install` por si se añaden paquetes.)

## Uso — comandos comunes
- Analizar un archivo `.jv`:

```bash
node analizador.js programaEjemplo.jv
```

- Ejecutar la app principal (si aplica):

```bash
node app.js
```

- Validar datos JSON con el validador generado:

```bash
node validadorGenerado.js datosBuenos.json
node validadorGenerado.js datosMalos.json
```

- Traducir/transformar entradas:

```bash
node translator.js ejemplo1.jv
```

## Estructura del repositorio
- `analizador.js` — Analizador léxico y sintáctico principal.
- `translator.js` — Traductor/transformador de AST/formatos.
- `validadorGenerado.js` — Validador de datos (Zod/JSON Schema).
- `esquema.json` — Esquema de ejemplo para validación.
- `datosBuenos.json`, `datosMalos.json`, `datosJsonInvalidos.json` — casos de prueba.
- `programaEjemplo.jv`, `programaEjemploInvalido.jv`, `ejemploBueno.jv`, `ejemploConErrores.jv` — ejemplos de código fuente.
- `README.md` — Este archivo.

## Ejemplos rápidos
- Analizador (muestra tokens, errores y AST si procede):

```bash
node analizador.js ejemploBueno.jv
node analizador.js ejemploConErrores.jv
```

- Validación de datos:

```bash
node validadorGenerado.js datosBuenos.json
node validadorGenerado.js datosMalos.json
```

## Contribuir
Si quieres mejorar el proyecto:

1. Crea una rama: `git checkout -b feature/mi-mejora`
2. Haz tus cambios y pruebas.
3. Envía un pull request describiendo los cambios.

---
Actualizado: versión mejorada del README para presentación en GitHub.
