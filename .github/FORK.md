# Mantenimiento del fork

`origin` es tu repositorio, `MDaniel592/abacus`. `upstream` es el proyecto original, `victorbalssa/abacus`. Las ramas que ves bajo `upstream/` pertenecen al original y no se eliminan al limpiar tu fork.

## Las tres ramas

| Rama en tu fork | Uso |
| --- | --- |
| `develop` | Base del proyecto original. Se mantiene alineada con `upstream/develop`, sin añadir aquí las personalizaciones. |
| `personal` | Versión personal completa y documentación actualizada. Es la base para seguir desarrollando y compilar tu APK. |
| `fix/transaction-form-ux` | Trabajo previo del formulario y de Perspectiva, conservado como referencia. Sus cambios están incluidos en `personal`. |

`personal` se creó desde `fix/transaction-form-ux`, conservando su historial. No se ha integrado la versión personal en `develop`. La rama predeterminada de GitHub puede seguir siendo `develop`; para trabajar en esta versión selecciona `personal`.

La revisión del 14 de octubre de 2026 encontró 17 commits de la rama del formulario sobre `develop`. La rama `claude/design-contrast-review-bjiu70` ya estaba incluida. La rama `copilot/fix-small-font-issue` propone tamaños de texto para una versión anterior de Inicio y no se integra automáticamente en el diseño actual. Las ramas retiradas de `origin` se conservan con etiquetas `archive/2026-10-14/…`, incluido el antiguo `master`.

## Trabajo habitual

```sh
git switch personal
# Modificar y comprobar el código.
npm run lint
npm run test:unit
npx tsc --noEmit
git add <archivos>
git commit -m "Descripción del cambio"
git push origin personal
```

Para cambios futuros se pueden abrir ramas temporales desde `personal` e integrarlas mediante una pull request dirigida a `personal`. La rama `fix/transaction-form-ux` no necesita recibir los siguientes cambios.

## Incorporar actualizaciones del original

Con el árbol de trabajo limpio:

```sh
git fetch --all --prune
git switch develop
git merge --ff-only upstream/develop
git push origin develop
git switch personal
git merge develop
```

Si aparecen conflictos al integrar en `personal`, resuélvelos conservando la intención de ambas versiones y ejecuta las comprobaciones anteriores. Si necesitas cancelar esa integración antes de completarla, utiliza `git merge --abort`. Cuando todo esté validado:

```sh
git push origin personal
```

No es necesario enviar tus personalizaciones al proyecto original para mantener el fork actualizado.
