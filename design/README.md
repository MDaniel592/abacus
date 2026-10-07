# Demo Perspectiva

Demo interactiva: http://192.168.1.50:8095 (misma red local).

Arrancar o mantener el servidor:

```sh
docker compose -f compose.preview.yml up -d
```

`index.html`, `demo.js` y `demo.css` muestran el diseño elegido. Incluye balances mensuales por cuenta, categorías con ingresos/gastos/diferencia, filtros combinados por categoría y etiqueta, y creación, edición, duplicación y eliminación de movimientos. El formulario tiene detalles visibles, autocompletado, fecha y hora mediante selectores y colores por tipo.

Los datos son de ejemplo. Los cambios de movimientos viven en memoria hasta recargar la página; no se envían a Firefly III. La demo permite revisar el diseño sin compilar un APK.

`ux-alternatives.html` conserva las cuatro alternativas iniciales.
