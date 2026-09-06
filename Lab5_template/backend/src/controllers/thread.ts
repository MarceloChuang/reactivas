// =============================================================
// P3 - Endpoint api/thread/:id
// -------------------------------------------------------------
//   GET  /api/thread/:id  -> obtener todos los comentarios de un thread.
//   POST /api/thread/:id  -> agregar un comentario nuevo al thread.
// =============================================================
import express from 'express'
import Post from '../models/post.js'
import { ApiError } from '../utils/middleware.js'

const threadRouter = express.Router()

const normalizeAuthor = (author: unknown): string | null => {
  if (typeof author !== 'string') return null
  const trimmed = author.trim()
  return trimmed.length === 0 ? null : trimmed
}

// P3/P4 - Valida que el :id de la URL sea un numero. Si no lo es
// lanzamos un 400 controlado en vez de dejar que la consulta falle.
const parseId = (rawId: string): number => {
  const id = Number(rawId)
  if (!Number.isInteger(id)) {
    throw new ApiError(400, 'malformatted id')
  }
  return id
}

// P3/P4 - Busca el thread y lanza 404 si no existe, evitando que el
// frontend reciba un null inesperado y se caiga la pagina.
const findThreadOr404 = async (id: number) => {
  const thread = await Post.findOne({ id, thread: null })
  if (!thread) {
    throw new ApiError(404, `No existe el thread con id ${id}`)
  }
  return thread
}

// -------------------------------------------------------------
// P3 - GET /api/thread/:id
// Responde { thread, comments }, que es la forma que ya consumia el
// frontend del laboratorio anterior (interface ThreadAnswer).
// -------------------------------------------------------------
threadRouter.get('/:id', async (request, response) => {
  const id = parseId(request.params.id)
  const thread = await findThreadOr404(id)

  const comments = await Post.find({ thread: id }).sort({ id: 1 })

  response.json({ thread, comments })
})

// -------------------------------------------------------------
// P3 - POST /api/thread/:id
// Agrega un comentario al thread indicado. El campo `parent` es
// opcional: si viene, el comentario responde a otro post del mismo
// thread. Las validaciones de P1 se aplican igual que en P2.
// -------------------------------------------------------------
threadRouter.post('/:id', async (request, response) => {
  const id = parseId(request.params.id)
  await findThreadOr404(id)

  const { content, author, parent } = request.body

  // P4 - Si se responde a un post, verificamos que exista y que
  // pertenezca a este thread (o que sea el thread mismo).
  let parentId: number | null = null
  if (parent !== undefined && parent !== null) {
    const parsedParent = Number(parent)
    if (!Number.isInteger(parsedParent)) {
      throw new ApiError(400, 'El campo parent debe ser un numero')
    }
    const parentPost = await Post.findOne({ id: parsedParent })
    if (!parentPost) {
      throw new ApiError(404, `No existe el post con id ${parsedParent}`)
    }
    if (parentPost.id !== id && parentPost.thread !== id) {
      throw new ApiError(400, 'El post respondido pertenece a otro thread')
    }
    parentId = parsedParent
  }

  const comment = new Post({
    content,
    author: normalizeAuthor(author),
    thread: id,
    parent: parentId,
    likes: 0,
    dislikes: 0,
  })

  const savedComment = await comment.save()
  response.status(201).json(savedComment)
})

export default threadRouter
