// =============================================================
// P5 - Endpoint api/posts/:id
// -------------------------------------------------------------
//   PUT /api/posts/:id -> actualizar una publicacion (thread o
//   comentario). Lo usa el frontend para los likes y dislikes.
//
// Segun la nota del enunciado el endpoint SOBRESCRIBE el objeto:
// el cliente manda una copia completa del post con el campo ya
// modificado, no un parche parcial.
// =============================================================
import express from 'express'
import Post from '../models/post.js'
import { ApiError } from '../utils/middleware.js'

const postsRouter = express.Router()

const postsRouterParseId = (rawId: string): number => {
  const id = Number(rawId)
  if (!Number.isInteger(id)) {
    throw new ApiError(400, 'malformatted id')
  }
  return id
}

// -------------------------------------------------------------
// P5 - GET /api/posts/:id
// No lo pide el enunciado, pero deja el recurso consultable de forma
// individual y sirve para comprobar el resultado de un PUT.
// -------------------------------------------------------------
postsRouter.get('/:id', async (request, response) => {
  const id = postsRouterParseId(request.params.id)
  const post = await Post.findOne({ id })

  if (!post) {
    throw new ApiError(404, `No existe el post con id ${id}`)
  }

  response.json(post)
})

// -------------------------------------------------------------
// P5 - PUT /api/posts/:id
// Sobrescribe el post con el objeto recibido. Se ignoran los campos
// de identidad (id, thread, parent, createdAt) para que una copia
// mal armada del cliente no pueda mover un comentario de thread ni
// reescribir su historia; el resto del objeto si se reemplaza.
// runValidators mantiene vigentes las restricciones de P1.
// -------------------------------------------------------------
postsRouter.put('/:id', async (request, response) => {
  const id = postsRouterParseId(request.params.id)
  const { content, author, likes, dislikes } = request.body

  const existing = await Post.findOne({ id })
  if (!existing) {
    throw new ApiError(404, `No existe el post con id ${id}`)
  }

  const updatedFields = {
    content: content !== undefined ? content : existing.content,
    author: author === undefined
      ? existing.author
      : (typeof author === 'string' && author.trim().length > 0 ? author.trim() : null),
    likes: likes !== undefined ? Number(likes) : existing.likes,
    dislikes: dislikes !== undefined ? Number(dislikes) : existing.dislikes,
  }

  // P4 - Un cuerpo con likes: "muchos" produciria NaN y romperia el
  // contador, asi que lo rechazamos antes de tocar la base de datos.
  if (Number.isNaN(updatedFields.likes) || Number.isNaN(updatedFields.dislikes)) {
    throw new ApiError(400, 'Los campos likes y dislikes deben ser numeros')
  }

  const updatedPost = await Post.findOneAndUpdate(
    { id },
    updatedFields,
    { new: true, runValidators: true, context: 'query' },
  )

  response.json(updatedPost)
})

export default postsRouter
