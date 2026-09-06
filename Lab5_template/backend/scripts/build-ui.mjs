// =============================================================
// P6 - npm run build:ui
// -------------------------------------------------------------
// Compila el frontend con Vite y copia el resultado a backend/dist,
// que es la carpeta que sirve Express. El enunciado propone hacerlo
// con `rm -rf` y `cp -r`; aqui se hace en Node para que funcione
// igual en Windows, macOS y en el servidor del curso.
// =============================================================
import { execSync } from 'node:child_process'
import { cpSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const backendDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const frontendDir = path.join(backendDir, '..', 'frontend')
const frontendDist = path.join(frontendDir, 'dist')
const backendDist = path.join(backendDir, 'dist')

const run = (command, cwd) => {
  console.log(`> ${command}`)
  execSync(command, { cwd, stdio: 'inherit', shell: true })
}

// 1. Borrar el build anterior del backend.
rmSync(backendDist, { recursive: true, force: true })

// 2. Compilar el frontend.
run('npm run build', frontendDir)

if (!existsSync(frontendDist)) {
  console.error(`No se encontro el build del frontend en ${frontendDist}`)
  process.exit(1)
}

// 3. Copiar frontend/dist -> backend/dist.
cpSync(frontendDist, backendDist, { recursive: true })

console.log(`\nFrontend compilado y copiado a ${backendDist}`)
