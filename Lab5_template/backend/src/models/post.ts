// =============================================================
// P1 - Conexion con MongoDB y schema de comentarios/threads
// -------------------------------------------------------------
// Restricciones pedidas por el enunciado:
//   * El largo de un comentario no puede exceder 300 caracteres.
//   * El largo de un comentario tiene que ser al menos 1.
//   * El autor no puede llamarse "Huevito rey", "Matias Toro"
//     ni "Memes es mal ramo".
// =============================================================
import mongoose from 'mongoose'
import { getNextSequence } from './counter.js'

// Un mismo schema modela threads y comentarios: un thread es un post
// con `thread === null`, y un comentario es un post cuyo campo
// `thread` apunta al id del thread al que pertenece.
export interface PostDocument extends mongoose.Document {
  id: number
  content: string
  author: string | null
  thread: number | null
  parent: number | null
  likes: number
  dislikes: number
  createdAt: Date
  updatedAt: Date
}

// P1 - Lista de nombres prohibidos para el autor.
export const FORBIDDEN_AUTHORS = [
  'Huevito rey',
  'Matías Toro',
  'Memes es mal ramo',
]

// Normaliza para comparar sin distinguir mayusculas, espacios
// sobrantes ni tildes: asi "MATIAS TORO" tambien queda bloqueado.
const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const FORBIDDEN_AUTHORS_NORMALIZED = FORBIDDEN_AUTHORS.map(normalize)

const postSchema = new mongoose.Schema<PostDocument>(
  {
    // id numerico autoincremental (ver models/counter.ts).
    id: {
      type: Number,
      unique: true,
      index: true,
    },

    // P1 - Restricciones de largo del contenido: entre 1 y 300 caracteres.
    content: {
      type: String,
      required: [true, 'El contenido del post es obligatorio'],
      minlength: [1, 'El contenido debe tener al menos 1 caracter'],
      maxlength: [300, 'El contenido no puede exceder los 300 caracteres'],
    },

    // P1 - Restriccion de nombres prohibidos para el autor.
    // `author` es opcional (posts anonimos guardan null), pero si viene
    // con un valor este no puede estar en la lista negra.
    author: {
      type: String,
      default: null,
      validate: {
        validator: (value: string | null) => {
          if (value === null || value === undefined) return true
          return !FORBIDDEN_AUTHORS_NORMALIZED.includes(normalize(value))
        },
        message: props =>
          `El nombre "${props.value}" no esta permitido como autor`,
      },
    },

    // null => el post es un thread. Un numero => es comentario de ese thread.
    thread: {
      type: Number,
      default: null,
    },

    // null => no responde a nadie. Un numero => id del post respondido.
    parent: {
      type: Number,
      default: null,
    },

    likes: {
      type: Number,
      default: 0,
      min: [0, 'Los likes no pueden ser negativos'],
    },

    dislikes: {
      type: Number,
      default: 0,
      min: [0, 'Los dislikes no pueden ser negativos'],
    },
  },
  {
    // Genera automaticamente createdAt y updatedAt exigidos por la interfaz.
    timestamps: true,
  },
)

// Antes de guardar un post nuevo le asignamos el siguiente id numerico.
postSchema.pre('save', async function (next) {
  if (this.isNew && this.id === undefined) {
    this.id = await getNextSequence('posts')
  }
  next()
})

// Dejamos la respuesta JSON exactamente con la forma de la interfaz Post
// del frontend: sin _id ni __v, y con las fechas como string ISO.
postSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    const { _id, __v, createdAt, updatedAt, ...rest } = returnedObject
    void _id
    void __v
    return {
      ...rest,
      createdAt: (createdAt as Date).toISOString(),
      updatedAt: (updatedAt as Date).toISOString(),
    }
  },
})

const Post = mongoose.model<PostDocument>('Post', postSchema)

export default Post
