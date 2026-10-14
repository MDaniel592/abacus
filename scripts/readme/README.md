# Capturas del README

La galería se genera desde el código de las pantallas y la navegación de `personal`, mediante React Native Web. No utiliza `design/index.html`. Las capturas son una previsualización en Chromium con datos ficticios, no fotografías ni capturas del APK Android instalado.

Referencia de código: `a101691`, versión declarada `0.25.0`, Android `versionCode` 53. Fecha de captura y reloj de los ejemplos: 14 de octubre de 2026. Resolución: 390 × 844 píxeles CSS, escala 2. Salida: `.github/img/personal/current/`.

## Regenerar

Con Node.js 22, las dependencias del proyecto instaladas (`npm ci`) y las dependencias del navegador disponibles:

```sh
npm install --prefix /tmp/abacus-readme-tools --no-save esbuild@0.28.2 playwright@1.58.2
export README_TOOLS_DIR=/tmp/abacus-readme-tools/node_modules
"$README_TOOLS_DIR/.bin/playwright" install --with-deps chromium
node scripts/readme/build.cjs
node scripts/readme/capture.cjs
```

`build.cjs` crea un punto de entrada temporal que exporta el navegador `Home` de `src/routes/index.tsx` sin modificar ese archivo. Usa las pantallas reales, React Navigation, los gráficos, las fuentes y los mapas de iconos del repositorio. El bundle y su HTML se guardan en `/tmp/abacus-readme-ui/`.

`fixture.jsx` proporciona un almacén con cuentas, movimientos y series de ejemplo. Sustituye las llamadas de los modelos por funciones locales. Las integraciones de autenticación, almacenamiento seguro, vibración, enlaces externos y reseñas se simulan; el selector nativo de fecha no se monta. Los iconos conservan sus glifos y fuentes, con un adaptador de carga para el navegador. Estas sustituciones solo se aplican al generador, no a la app.

`capture.cjs` recorre Inicio, Gráficos y Movimientos en claro y oscuro, comprueba que exista la pestaña Gráficos y rechaza errores de ejecución o desbordamientos horizontales de la página. Bloquea las solicitudes HTTP para que las capturas sean independientes de cualquier servidor. El renderizado web puede diferir del nativo en medidas, desplazamiento y controles; estas imágenes no sustituyen la validación visual del APK.
