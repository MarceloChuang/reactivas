// =============================================================
// Servicio HTTP del frontend.
// -------------------------------------------------------------
// P2/P3/P5: se reemplazaron las conexiones al servidor externo del
// laboratorio anterior por los endpoints del backend propio:
//   GET/POST  /api/threads      (P2)
//   GET/POST  /api/thread/:id   (P3)
//   PUT       /api/posts/:id    (P5)
// =============================================================
import axios from 'axios'
import type { Post } from '../types/posts'

// P2 - Endpoint de threads.
const threadsUrl = '/api/threads'

// P3 - Endpoint de un thread concreto y sus comentarios.
const threadUrl = '/api/thread'

// P5 - Endpoint de actualizacion de publicaciones.
const postsUrl = '/api/posts'

// -------------------------------------------------------------
// P4 - Traduce el error de axios al mensaje que envia el
// errorHandler del backend, para que el toast muestre la causa real
// ("El contenido no puede exceder los 300 caracteres") en vez de un
// generico "Request failed with status code 400".
// -------------------------------------------------------------
const toReadableError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error
    if (typeof message === 'string') {
      return new Error(message)
    }
    if (!error.response) {
      return new Error('No se pudo conectar con el servidor')
    }
  }
  return error instanceof Error ? error : new Error('Error desconocido')
}

// P2 - GET /api/threads: todos los threads del foro.
const getAll = () => {
  return axios
    .get<Post[]>(threadsUrl)
    .then(response => response.data)
    .catch((error) => { throw toReadableError(error) })
}

interface ThreadAnswer {
  thread: Post
  comments: Post[]
}

// P3 - GET /api/thread/:id: el thread junto a sus comentarios.
const getThread = (id: string) => {
  return axios
    .get<ThreadAnswer>(`${threadUrl}/${id}`)
    .then(response => response.data)
    .catch((error) => { throw toReadableError(error) })
}

interface ThreadCreateData {
  content: string
  author?: string
}

// P2 - POST /api/threads: crea un thread nuevo.
const create = (data: ThreadCreateData) => {
  return axios
    .post<Post>(threadsUrl, data)
    .then(response => response.data)
    .catch((error) => { throw toReadableError(error) })
}

interface CommentCreateData {
  content: string
  author?: string
  parent?: number
}

// P3 - POST /api/thread/:id: agrega un comentario al thread.
const createComment = (data: CommentCreateData, threadId: number) => {
  return axios
    .post<Post>(`${threadUrl}/${threadId}`, data)
    .then(response => response.data)
    .catch((error) => { throw toReadableError(error) })
}

// P5 - PUT /api/posts/:id: sobrescribe la publicacion. Lo usa PostBox
// para actualizar likes y dislikes enviando una copia del post.
const update = (id: number, newObject: Post) => {
  return axios
    .put<Post>(`${postsUrl}/${id}`, newObject)
    .then(response => response.data)
    .catch((error) => { throw toReadableError(error) })
}

export default {
  getAll,
  getThread,
  create,
  createComment,
  update,
}
