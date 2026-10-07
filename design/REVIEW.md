# Revisión de Abacus Personal — 7 octubre 2026

## Alcance

Revisión del código de navegación, inicio, categorías, movimientos, creación/edición, búsqueda y paginación, ajustes, conexión y funciones originales. Comprobación de la demo en Chromium a 390×844 y 360×740. Validación estática y exportación del paquete JavaScript Android. Esto no equivale a probar un APK instalado ni a comprobar respuestas de una instancia real de Firefly III.

## Diferencias respecto a la original

| Área | Original | Versión personal |
| --- | --- | --- |
| Diseño | Cabeceras amplias y color naranja por defecto | Perspectiva morado, cabecera compacta, menos tarjetas anidadas, densidad uniforme en todas las vistas y contraste refinado |
| Navegación | Pestaña de gráficos | Pestaña Categorías; botón central de añadir dentro de la barra |
| Inicio | Periodo inicial trimestral | Periodo inicial mensual, balances por cuenta conservados, selector emergente de mes/trimestre/semestre/año con elección de año |
| Categorías | Opción de mostrar solo gastos | Ingresos y gastos siempre; balance total primero, diferencias con signo/color y barras con escala común entre categorías |
| Movimientos | Filas de 90 px | Filas de 60 px, datos agrupados y precio rojo/verde/azul según el tipo |
| Filtros | Cuenta, tipo, moneda, fecha y búsqueda | Se conservan y se añaden categoría y etiqueta combinables, incluida «sin categoría», manteniéndose al cargar más páginas |
| Formulario | Detalles opcionales plegados | Categoría, presupuesto, factura, etiquetas y notas visibles; menos relleno y guardar accesible fuera del scroll |
| Importe | Alineación lateral | Centrado y coloreado por tipo |
| Cuentas del formulario | Origen y destino para todos los tipos | En gastos se oculta destino; en ingresos se oculta origen. Nuevos movimientos usan la contraparte predeterminada de Firefly III; editar conserva la contraparte existente. Transferencias muestran ambas cuentas |
| Fecha/hora | Selectores del sistema | Selectores conservados, debajo del importe, fecha «7 oct 2026», más grande y sin iconos |
| Autocompletado | Opciones de Firefly III | Se conserva la lista pulsable en descripción, cuentas, categoría, etiquetas, presupuesto y factura; se corrigen peticiones/callbacks obsoletos |
| Privacidad | Ocultar saldo desde inicio | Modo privado en Ajustes junto a claro/oscuro/sistema; oculta importes en vistas de cuentas, categorías, movimientos, presupuestos, facturas y huchas, y oculta proporciones de las barras |
| Instalación | Proyecto/identificador original | Fork propio, proyecto Expo de mmdaniel e identificador Android separado; perfil APK preparado |

## Funciones conservadas

Editar, duplicar y eliminar movimientos; transferencias; múltiples partidas y título de grupo; moneda extranjera; presupuestos, facturas y huchas; balances históricos por cuenta; orden de cuentas; monedas, búsqueda y filtros previos; gestión de credenciales y autenticación biométrica. Los gráficos se han retirado de la navegación a petición del usuario. El código de gráficos sigue en el repositorio.

El formulario de edición sigue mostrando sus campos e importes para poder modificarlos aunque esté activo el modo privado. La ocultación aplica a las vistas de consulta; no bloquea ni cifra la información.

## Correcciones revisadas

- Cambio gasto/ingreso sin salir: mueve la cuenta de activo al lado correcto y elimina identificadores incompatibles del comercio/contraparte, presupuesto y factura.
- Escribir sobre una cuenta o categoría seleccionada invalida su identificador anterior.
- Las sugerencias cancelan peticiones anteriores y usan el estado vigente.
- Se impiden envíos simultáneos y se conserva la opción de seguir en el formulario después de guardar.
- Cancelar fecha/hora no sustituye la fecha por un valor vacío.
- Búsqueda codificada, con la fecha final elegida y filtros iguales en todas las páginas.
- Respuestas de búsquedas antiguas no reemplazan la paginación actual.
- Una eliminación fallida conserva el movimiento en pantalla.
- La media diaria no usa un divisor negativo al consultar meses futuros.
- Enero y los demás meses tienen el mismo tamaño; modo privado y apariencia se cambian exclusivamente en Ajustes.

## Verificaciones y límites

20 pruebas unitarias para transiciones/envíos y búsqueda/paginación. ESLint, TypeScript y exportación Android. Prueba de navegador: meses, trimestres, semestres y años, balances del periodo, botón añadir fijo y centrado, formulario compacto, sugerencias pulsables, fecha/hora, crear/editar/duplicar/eliminar/cancelar, barras/diferencias, filtros combinados, búsqueda, modo privado y tema oscuro.

La demo usa datos ficticios en memoria. Ajustes ya no contiene enlaces a las propuestas ni controles de restablecer datos de ejemplo. No reproduce toda la configuración, las múltiples partidas ni la conexión real. En la app nativa esos flujos se han conservado y revisado en código. APK release generado: Abacus Personal 0.25.0, versionCode 41, arm64-v8a. Verificados firma personal v2, paquete, versión, ausencia de indicador debuggable, integridad ZIP, alineación de 16 KB, bundle JavaScript/Hermes y descarga HTTP con SHA-256 coincidente. La reanudación con caché y mayor límite de metaspace terminó correctamente en 3 min 32 s (955 tareas reutilizadas). No se ha probado todavía en el S23 Ultra. Queda la validación en el dispositivo con Firefly III: API y autocompletado reales, teclado, biometría, guardado/edición y actualización del APK.
