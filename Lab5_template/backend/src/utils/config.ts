// =============================================================
// Configuracion general (usada por P1 para conectar a MongoDB
// y por P6 para el deploy en el servidor del curso)
// =============================================================
import dotenv from 'dotenv'

dotenv.config()

// URI del cluster/instancia de MongoDB.
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017'

// Nombre de la base de datos dentro de esa instancia.
const MONGODB_DBNAME = process.env.MONGODB_DBNAME ?? 'fullstack'

// Puerto del servidor. En produccion (P6) cada grupo usa su puerto unico.
const PORT = Number(process.env.PORT ?? 3001)

// HOST 0.0.0.0 en produccion para aceptar conexiones externas.
const HOST = process.env.HOST ?? '127.0.0.1'

export default { MONGODB_URI, MONGODB_DBNAME, PORT, HOST }
