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
## Ejemplos y Resultados

```Ejemplo sin errores```

<img width="311" height="146" alt="image" src="https://github.com/user-attachments/assets/2a8a61b1-a8eb-4d7a-982a-a5ae903d7093" />

<img width="573" height="747" alt="image" src="https://github.com/user-attachments/assets/7c0580d2-7043-4152-93ff-09296bc862ac" />

<img width="368" height="758" alt="image" src="https://github.com/user-attachments/assets/dbddd65e-5730-4b75-9b15-78bb2b673ec0" />

<img width="386" height="776" alt="image" src="https://github.com/user-attachments/assets/1bbea69b-3dd9-45e9-9f69-0f5213e88622" />

<img width="480" height="501" alt="image" src="https://github.com/user-attachments/assets/782251d6-5aba-4941-8135-bf047bd77b22" />

```Ejemplo con errores```

<img width="297" height="141" alt="image" src="https://github.com/user-attachments/assets/4afbfbf8-cfff-4627-923f-adb2df5e0ac4" />

<img width="602" height="741" alt="image" src="https://github.com/user-attachments/assets/95e2406f-24f4-4c35-aaa9-30b3cda695ed" />

<img width="550" height="745" alt="image" src="https://github.com/user-attachments/assets/d2096cae-eb8c-4a62-ab80-7e292c447a64" />

<img width="366" height="769" alt="image" src="https://github.com/user-attachments/assets/f8010901-5df8-4745-be6f-93757b307e40" />

<img width="486" height="764" alt="image" src="https://github.com/user-attachments/assets/9d9bd00c-8811-4c11-b934-7dde492ff2fe" />

<img width="486" height="534" alt="image" src="https://github.com/user-attachments/assets/e1e1e5ba-4733-4bef-8921-5f28d631faba" />


## Contribuir
Si quieres mejorar el proyecto:

1. Crea una rama: `git checkout -b feature/mi-mejora`
2. Haz tus cambios y pruebas.
3. Envía un pull request describiendo los cambios.

---
Actualizado: versión mejorada del README para presentación en GitHub.
