// =============================================================
// P2 - Endpoint api/threads
// -------------------------------------------------------------
//   GET  /api/threads  -> obtener todos los threads creados.
//   POST /api/threads  -> crear un thread nuevo.
// =============================================================
import express from 'express'
import Post from '../models/post.js'

const threadsRouter = express.Router()

// Normaliza el autor recibido desde el formulario: el frontend envia
// author: '' cuando el campo queda vacio, y la interfaz Post pide null.
const normalizeAuthor = (author: unknown): string | null => {
  if (typeof author !== 'string') return null
  const trimmed = author.trim()
  return trimmed.length === 0 ? null : trimmed
}

// -------------------------------------------------------------
// P2 - GET /api/threads
// Devuelve todos los threads (posts con thread === null), es decir
// las publicaciones raiz, ordenadas por id ascendente.
// -------------------------------------------------------------
threadsRouter.get('/', async (_request, response) => {
  const threads = await Post.find({ thread: null }).sort({ id: 1 })
  response.json(threads)
})

// -------------------------------------------------------------
// P2 - POST /api/threads
// Crea un thread nuevo. Un thread es un post con thread === null y
// parent === null. Si el contenido o el autor no cumplen las
// restricciones de P1, Mongoose lanza un ValidationError que atrapa
// el errorHandler de P4 y responde con 400.
// -------------------------------------------------------------
threadsRouter.post('/', async (request, response) => {
  const { content, author } = request.body

  const thread = new Post({
    content,
    author: normalizeAuthor(author),
    thread: null,
    parent: null,
    likes: 0,
    dislikes: 0,
  })

  const savedThread = await thread.save()
  response.status(201).json(savedThread)
})

export default threadsRouter
