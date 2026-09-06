// =============================================================
// P4 - Middlewares de la API
// -------------------------------------------------------------
// Aqui vive todo el manejo de errores pedido por el enunciado:
//   * Errores de validacion al crear threads.
//   * Errores de validacion al crear comentarios.
//   * Errores que podrian botar la pagina en ejecucion (ids con
//     formato invalido, JSON malformado, rutas inexistentes,
//     y cualquier excepcion no prevista).
// =============================================================
import type { ErrorRequestHandler, RequestHandler } from 'express'
import mongoose from 'mongoose'
import logger from './logger.js'

// -------------------------------------------------------------
// P4 - Error propio de la aplicacion.
// Permite que los controladores lancen errores con un status HTTP
// concreto (por ejemplo, 404 cuando un thread no existe) y que el
// errorHandler los traduzca sin tener que repetir logica.
// -------------------------------------------------------------
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// -------------------------------------------------------------
// P4 - Registro de cada peticion que llega a la API.
// Sirve para depurar el backend durante el desarrollo.
// -------------------------------------------------------------
export const requestLogger: RequestHandler = (request, _response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

// -------------------------------------------------------------
// P4 - Rutas /api inexistentes.
// Sin esto una URL mal escrita caeria en el fallback del SPA y el
// frontend recibiria HTML donde espera JSON.
// -------------------------------------------------------------
export const unknownEndpoint: RequestHandler = (_request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}

// -------------------------------------------------------------
// P4 - Manejador central de errores.
// Va montado al final de la cadena: cualquier error lanzado en un
// controlador (o pasado con next(error)) termina aqui y se responde
// siempre con JSON, evitando que el proceso se caiga.
// -------------------------------------------------------------
export const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  logger.error(error instanceof Error ? error.message : error)

  // Si ya se empezo a enviar la respuesta, delegamos en Express.
  if (response.headersSent) {
    next(error)
    return
  }

  // P4 - Errores de validacion de Mongoose al crear threads y comentarios:
  // contenido vacio, contenido de mas de 300 caracteres o autor prohibido.
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map(e => e.message)
    response.status(400).json({
      error: messages.join('. '),
      details: messages,
    })
    return
  }

  // P4 - Id con formato invalido (por ejemplo /api/thread/abc).
  if (error instanceof mongoose.Error.CastError) {
    response.status(400).json({ error: 'malformatted id' })
    return
  }

  // P4 - Violacion de indice unico (id duplicado).
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    response.status(409).json({ error: 'el recurso ya existe' })
    return
  }

  // P4 - JSON malformado en el cuerpo de la peticion.
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'JSON malformado en el cuerpo de la peticion' })
    return
  }

  // P4 - Errores propios lanzados por los controladores (404, 400, etc).
  if (error instanceof ApiError) {
    response.status(error.status).json({ error: error.message })
    return
  }

  // P4 - Cualquier otro error inesperado: respondemos 500 en vez de
  // dejar que la excepcion tumbe el servidor.
  response.status(500).json({ error: 'internal server error' })
}

export default { requestLogger, unknownEndpoint, errorHandler, ApiError }
