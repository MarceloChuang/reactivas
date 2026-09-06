// =============================================================
// Aplicacion Express: arma la cadena de middlewares y monta los
// endpoints de P2, P3 y P5. El manejo de errores es el de P4.
// =============================================================
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import config from './utils/config.js'
import logger from './utils/logger.js'
import { errorHandler, requestLogger, unknownEndpoint } from './utils/middleware.js'

import threadsRouter from './controllers/threads.js'
import threadRouter from './controllers/thread.js'
import postsRouter from './controllers/posts.js'

const app = express()

// -------------------------------------------------------------
// P1 - Conexion con MongoDB
// -------------------------------------------------------------
mongoose.set('strictQuery', false)

logger.info('conectando a MongoDB...')
mongoose
  .connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME })
  .then(() => {
    logger.info(`conectado a MongoDB (db: ${config.MONGODB_DBNAME})`)
  })
  .catch((error: Error) => {
    // P4 - Si la base de datos no responde lo registramos en vez de
    // dejar que una promesa rechazada tumbe el proceso.
    logger.error('error conectando a MongoDB:', error.message)
  })

// -------------------------------------------------------------
// Middlewares base
// -------------------------------------------------------------
app.use(cors())
app.use(express.json())
app.use(requestLogger) // P4

// -------------------------------------------------------------
// P6 - Frontend compilado.
// `npm run build:ui` deja el build de Vite en backend/dist. El router
// del frontend usa basename="/threads", por eso se sirve bajo esa ruta.
// -------------------------------------------------------------
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(currentDir, '..', 'dist')

app.use('/threads', express.static(distPath))
app.get('/', (_request, response) => {
  response.redirect('/threads')
})

// -------------------------------------------------------------
// Endpoints de la API
// -------------------------------------------------------------
app.use('/api/threads', threadsRouter) // P2
app.use('/api/thread', threadRouter) // P3
app.use('/api/posts', postsRouter) // P5

// P4 - Cualquier ruta bajo /api que no exista responde JSON, no HTML.
app.use('/api', unknownEndpoint)

// -------------------------------------------------------------
// P6 - Fallback del SPA: /threads/5 lo resuelve React Router en el
// cliente, asi que devolvemos index.html para esas rutas.
// -------------------------------------------------------------
app.get('/threads/{*splat}', (_request, response) => {
  response.sendFile(path.join(distPath, 'index.html'))
})

// P4 - Cualquier otra ruta desconocida.
app.use(unknownEndpoint)

// P4 - Manejador de errores: siempre al final de la cadena.
app.use(errorHandler)

export default app
