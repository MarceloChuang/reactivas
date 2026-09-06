// =============================================================
// P2/P3 - Datos iniciales
// -------------------------------------------------------------
// El enunciado pide crear archivos json con la estructura de la
// interfaz Post. src/data/posts.json contiene esos datos y este
// script los carga en MongoDB para poder probar los endpoints.
//
// Uso:  npm run seed
// Ojo:  borra los posts existentes antes de insertar.
// =============================================================
import mongoose from 'mongoose'

import config from './config.js'
import logger from './logger.js'
import Post from '../models/post.js'
import Counter from '../models/counter.js'
import postsData from '../data/posts.json' with { type: 'json' }

interface SeedPost {
  id: number
  content: string
  author: string | null
  thread: number | null
  parent: number | null
  createdAt: string
  updatedAt: string
  likes: number
  dislikes: number
}

// El JSON se importa (en vez de leerlo con fs) para que `tsc` lo copie
// al build y el seed tambien funcione en produccion.
const posts = postsData as SeedPost[]

const seed = async () => {
  await mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME })
  logger.info(`conectado a MongoDB (db: ${config.MONGODB_DBNAME})`)

  await Post.deleteMany({})

  // Se insertan con updateOne + upsert (en vez de insertMany) porque
  // `timestamps: false` conserva las fechas createdAt/updatedAt del JSON
  // en vez de reemplazarlas por la fecha de insercion. runValidators
  // deja que las restricciones de P1 se apliquen tambien a la semilla.
  for (const post of posts) {
    await Post.updateOne(
      { id: post.id },
      {
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      },
      { upsert: true, timestamps: false, runValidators: true },
    )
  }

  // Dejamos el contador de ids justo despues del ultimo post insertado
  // para que los POST nuevos no choquen con los ids de la semilla.
  const maxId = posts.reduce((max, post) => Math.max(max, post.id), 0)
  await Counter.findByIdAndUpdate(
    'posts',
    { seq: maxId },
    { upsert: true },
  )

  logger.info(`insertados ${posts.length} posts (contador en ${maxId})`)
  await mongoose.connection.close()
}

seed().catch(async (error: Error) => {
  logger.error('error poblando la base de datos:', error.message)
  await mongoose.connection.close()
  process.exit(1)
})
