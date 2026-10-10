# Pruebas del Pokédex

Las pruebas unitarias usan Vitest. Las pruebas E2E usan Cypress y recorren la aplicación en un navegador.

Ejecuta los comandos desde la carpeta del proyecto:

```powershell
Set-Location "$env:USERPROFILE\OneDrive\Desktop\seminario 9-10"
```

El proyecto declara pnpm `10.33.0`. Comprueba que Node y pnpm están disponibles antes de instalar:

```powershell
node --version
pnpm --version
```

```powershell
pnpm install
pnpm test
pnpm test:e2e
```

Para abrir Cypress y ejecutar los casos de forma interactiva:

```powershell
pnpm test:e2e:open
```

Los E2E cubren listado, búsqueda, filtros de tipo, ficha de Pokémon, navegación, recarga de una búsqueda y recuperación cuando falla una imagen. Requieren Chrome y conexión a internet: los loaders del servidor consultan PokeAPI. Los casos de API de Vitest usan MSW y respuestas locales.

## Reportes HTML automáticos

Cada ejecución terminada reemplaza el reporte anterior de esa suite, incluso si hay pruebas fallidas:

| Comando | Reporte |
| --- | --- |
| `pnpm test` | `reports/unitarias/index.html` |
| `pnpm test:e2e` | `reports/e2e/index.html` |

Puedes abrir los HTML con doble clic o desde PowerShell:

```powershell
Invoke-Item .\reports\e2e\index.html
Invoke-Item .\reports\unitarias\index.html
```

El reporte de Cypress incluye capturas de los fallos y enlaces a videos. Para compartirlo con los videos, envía toda la carpeta `reports/e2e`. El HTML de las pruebas unitarias se puede compartir solo.

`pnpm test:e2e:open` abre el modo interactivo de Cypress. Para guardar el reporte HTML de la suite, usa `pnpm test:e2e`.

Configuración basada en la [documentación de Mochawesome para Cypress](https://github.com/LironEr/cypress-mochawesome-reporter) y el [reporter HTML de Vitest](https://vitest.dev/guide/ui#html-reporter).

## Solución de los errores encontrados en Windows

### PowerShell no reconoce pnpm

Mensaje observado: `pnpm : El término 'pnpm' no se reconoce como nombre de un cmdlet...`.

En esta máquina Node estaba instalado, pero pnpm no estaba disponible para la terminal del usuario. Instala la versión del proyecto en la carpeta de programas de tu usuario:

```powershell
npm.cmd install --global pnpm@10.33.0 --prefix "$env:APPDATA\npm"
```

Cierra y abre PowerShell. Si sigue sin reconocerlo, agrega esa carpeta al PATH de la sesión actual:

```powershell
$env:Path = "$env:APPDATA\npm;$env:Path"
pnpm --version
```

También puedes usar la ruta completa sin cambiar el PATH:

```powershell
& "$env:APPDATA\npm\pnpm.cmd" install
& "$env:APPDATA\npm\pnpm.cmd" test:e2e:open
```

La ruta del runtime interno de Codex no es necesaria para ejecutar el proyecto desde tu terminal.

### Falta Cypress.exe aunque el paquete esté instalado

Mensajes observados: `No version of Cypress is installed in...` y `Cypress executable not found at...\Cypress.exe`.

El paquete dentro de `node_modules` y el ejecutable de Cypress en la caché son instalaciones distintas. Desde la carpeta del proyecto, instala y verifica el ejecutable:

```powershell
node node_modules/cypress/bin/cypress install
node node_modules/cypress/bin/cypress verify
```

Si la verificación sigue indicando que falta el ejecutable, fuerza la reinstalación:

```powershell
node node_modules/cypress/bin/cypress install --force
node node_modules/cypress/bin/cypress verify
```

Espera a que termine la descompresión y aparezca `Verified Cypress` antes de abrirlo. `pnpm test:e2e:open` ya ejecuta la instalación y verificación automáticamente.

### El lanzador muestra una ruta cortada y no encuentra el archivo

Salida observada después de instalar Cypress: `p0\..\.pnpm\cypress@16.0.0\...` seguida de `El sistema no puede encontrar la ruta especificada`.

El fallo apareció al usar el lanzador de Cypress generado por pnpm para Windows. Se ajustaron los scripts de `package.json` para invocar el CLI directamente mediante `node node_modules/cypress/bin/cypress`, tanto en modo interactivo como en la ejecución que genera el reporte.

Usa los comandos actualizados desde la carpeta del proyecto:

```powershell
pnpm test:e2e:open
# O ejecutar la suite y guardar el reporte:
pnpm test:e2e
```

No edites los archivos de `node_modules/.bin`: pnpm puede regenerarlos al instalar dependencias.

### El puerto 5174 ya está ocupado

Mensaje observado: `Error: Port 5174 is already in use`.

En esta sesión ocurrió porque quedó activo el servidor de una verificación anterior. Cada comando E2E inicia su propio servidor en el puerto 5174. Cierra la ventana anterior de Cypress y presiona `Ctrl+C` en la terminal que inició ese servidor antes de volver a ejecutar el comando.

Si no sabes qué proceso usa el puerto, consulta su identificador y su comando:

```powershell
$conexionesE2e = Get-NetTCPConnection -LocalPort 5174 -State Listen -ErrorAction SilentlyContinue
$conexionesE2e | Select-Object LocalAddress, LocalPort, OwningProcess
foreach ($conexionE2e in $conexionesE2e) {
    Get-CimInstance Win32_Process -Filter "ProcessId = $($conexionE2e.OwningProcess)" |
        Select-Object ProcessId, Name, CommandLine
}
```

Cierra el proceso desde la terminal o aplicación que lo inició después de identificarlo. Cuando la consulta ya no muestre un servidor escuchando en ese puerto, vuelve a ejecutar una sola instancia:

```powershell
pnpm test:e2e:open
```

### Cypress no logra conectarse a Chrome

Mensaje observado: `Still waiting to connect to Chrome, retrying... (attempt .../62)`.

Este error apareció junto al conflicto del puerto y varias ejecuciones de Cypress. No se confirmó que liberar el puerto resolviera también la conexión con Chrome.

Para reintentar, cierra las sesiones anteriores de Cypress y las ventanas de Chrome abiertas por esas sesiones, detén sus servidores con `Ctrl+C`, confirma que el puerto 5174 está libre y abre una sola sesión con `pnpm test:e2e:open`.

Para obtener los resultados HTML, puedes usar la ejecución sin ventana interactiva, que sí se comprobó en esta máquina:

```powershell
pnpm test:e2e
Invoke-Item .\reports\e2e\index.html
```

Si también falla esa ejecución, conserva el primer error completo de la terminal para diagnosticarlo. El mensaje final `taskkill ... no se encontró el proceso` apareció durante la limpieza de un proceso que ya había terminado; por sí solo no identifica la causa del fallo de Chrome.

### No aparece el reporte HTML o muestra resultados anteriores

El modo `pnpm test:e2e:open` es interactivo. Para generar el HTML de la suite usa `pnpm test:e2e` y espera a que la terminal indique `HTML report successfully created!`.

Si el comando falla antes de que empiecen las pruebas —por ejemplo, por el puerto ocupado o un ejecutable faltante— no hay nuevos resultados de esa ejecución. Comprueba la fecha del archivo antes de interpretar un reporte anterior:

```powershell
Get-Item .\reports\e2e\index.html | Select-Object FullName, LastWriteTime
```

Las pruebas unitarias generan su reporte con `pnpm test`. Para abrirlo:

```powershell
Invoke-Item .\reports\unitarias\index.html
```
