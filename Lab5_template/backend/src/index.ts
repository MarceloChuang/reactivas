// =============================================================
// Punto de entrada del servidor.
// En produccion (P6) PM2 ejecuta `npm run start`, que corre este
// archivo ya compilado en build/index.js.
// =============================================================
import app from './app.js'
import config from './utils/config.js'
import logger from './utils/logger.js'

app.listen(config.PORT, config.HOST, () => {
  logger.info(`Server running on http://${config.HOST}:${config.PORT}`)
})
