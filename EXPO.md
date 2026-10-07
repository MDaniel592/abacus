# APK personal de Abacus

Esta copia utiliza el proyecto Expo `ef46b4e9-771d-4e19-ada2-5946ddfb078f`, de la cuenta `mmdaniel`, y el identificador Android `io.github.mdaniel592.abacus`.

## Compilación con Expo

Desde la copia de este repositorio, con Node instalado:

```sh
npm ci
npx eas-cli@latest login
npx eas-cli@latest project:info
npx eas-cli@latest build --platform android --profile preview
```

Inicia sesión con `mmdaniel`. La primera compilación local utiliza una firma propia: antes de compilar actualizaciones con EAS, importa ese mismo keystore en las credenciales Android del proyecto (`npx eas-cli@latest credentials --platform android`). No generes otro keystore para actualizar una instalación firmada localmente.

La firma local se conserva fuera del repositorio en `/root/.local/share/abacus-signing/abacus-personal.keystore`. Su alias y contraseñas están en `signing.env` dentro de esa misma carpeta privada. No se publican en GitHub ni en el servidor de descargas. Las actualizaciones deben mantener paquete y firma, y aumentar el `versionCode` por encima del instalado.

El proyecto ya está vinculado mediante `extra.eas.projectId` en `app.config.js`: no hace falta ejecutar `create-expo-app` ni crear otro repositorio.

Si prefieres compilar desde GitHub, conecta `MDaniel592/abacus` en la configuración del proyecto correcto de Expo. Selecciona la rama con los cambios, la plataforma Android y el perfil `preview`. La primera compilación puede requerir configurar las credenciales con la CLI.

## Instalar en el S23 Ultra

La primera versión local ya está disponible en [descargar APK 0.25.0 / 41 para ARM64](http://192.168.1.50:8095/downloads/abacus-personal-0.25.0-41-arm64.apk), desde la misma red que el servidor. En futuras compilaciones de EAS, utiliza el enlace que proporcione Expo. Abre el APK en el móvil. Permite la instalación desde el navegador o gestor de archivos cuando Android lo solicite.

La app aparece como **Abacus Personal**, junto a la oficial. Hay que introducir la conexión a Firefly III en la nueva instalación. El APK funciona sin un servidor de desarrollo.

Las actualizaciones OTA están desactivadas en esta primera versión. Para actualizar, compila otro APK con el mismo proyecto, identificador y firma. El perfil incrementa automáticamente el número de compilación.

## Comprobación del arreglo

1. Con la opción de cerrar el formulario tras guardar desactivada, introduce y guarda un gasto.
2. Sin salir, cambia a ingreso. La cuenta de activo debe pasar al destino y el comercio anterior debe desaparecer del origen.
3. Elige quién te paga, cambia el importe y guarda el ingreso.
4. Comprueba también el regreso a gasto y borrar/escribir cuentas seleccionadas anteriormente.

Las pruebas automatizadas comprueban la transición de cuentas y dos envíos consecutivos con la API simulada. La prueba contra tu Firefly III y en el móvil sigue siendo necesaria.

Documentación: [APK de Android](https://docs.expo.dev/build-reference/apk/), [compilar desde GitHub](https://docs.expo.dev/build/building-from-github/).

## Primera compilación local verificada

APK release de 60.902.670 bytes, paquete `io.github.mdaniel592.abacus`, versión `0.25.0`, versionCode `41`, arquitectura `arm64-v8a` para el S23 Ultra. Firma y alineación verificadas; todavía pendiente la prueba en el móvil.

SHA-256 del APK: `b0995590977f0be3da74540071897e8eae4e99914627a0081f68ea00f762d8d3`.

Se conserva el contenedor local `abacus-apk-build`, sus herramientas Android y la caché Gradle en `/opt/gradle-home`, además de los artefactos nativos del workspace. No eliminarlo para las próximas compilaciones locales. La primera ejecución agotó los 512 MiB de metaspace; la reanudación con 1 GiB pasó en 3 min 32 s y reutilizó 955 tareas. Este tiempo corresponde a reanudar esa compilación; no garantiza la duración de cambios futuros.
