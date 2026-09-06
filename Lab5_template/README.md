# Laboratorio 5 — Creando un servidor

CC5003 Aplicaciones Web Reactivas · Marcelo Chuang

Backend propio (Express + TypeScript + MongoDB) que reemplaza el servidor externo
que usaba el frontend del laboratorio anterior.

```
Lab5_template/
├── backend/          # servidor Express + Mongoose (nuevo, P1–P5)
│   ├── src/
│   │   ├── controllers/   # endpoints
│   │   ├── models/        # schemas de Mongoose
│   │   ├── utils/         # config, logger, middlewares, seed
│   │   ├── data/          # datos json de ejemplo
│   │   ├── app.ts         # cadena de middlewares y rutas
│   │   └── index.ts       # punto de entrada
│   └── scripts/build-ui.mjs
└── frontend/         # React + Vite del lab anterior (conectado al backend nuevo)
```

Cada archivo lleva comentarios con la pregunta que resuelve (`// P1 - ...`,
`// P2 - ...`, etc.).

---

## Cómo correrlo

**1. Backend** (necesita un MongoDB accesible):

```bash
cd backend
npm install
cp .env.example .env      # y completar MONGODB_URI / MONGODB_DBNAME
npm run seed              # opcional: carga los posts de ejemplo
npm run dev               # http://localhost:3001
```

**2. Frontend** (en otra terminal):

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173/threads
```

Vite proxea `/api` hacia `localhost:3001`, así que el frontend usa rutas
relativas y no hay problemas de CORS en desarrollo.

---

## P1 — MongoDB y schema con restricciones

Conexión a MongoDB y schema único que modela threads y comentarios: un **thread**
es un post con `thread === null`, y un **comentario** es un post cuyo campo
`thread` apunta al id del thread.

| Archivo | Qué hace |
|---|---|
| [backend/src/models/post.ts](backend/src/models/post.ts) | Schema `Post` con las tres restricciones del enunciado |
| [backend/src/models/counter.ts](backend/src/models/counter.ts) | Contador atómico para el `id: number` |
| [backend/src/utils/config.ts](backend/src/utils/config.ts) | Lee `MONGODB_URI`, `MONGODB_DBNAME`, `PORT`, `HOST` desde `.env` |
| [backend/src/app.ts](backend/src/app.ts) | `mongoose.connect(...)` |

Restricciones implementadas:

- **Largo máximo 300**: `maxlength: [300, ...]` sobre `content`.
- **Largo mínimo 1**: `required` + `minlength: [1, ...]`.
- **Nombres prohibidos**: validador propio sobre `author` que rechaza
  `Huevito rey`, `Matías Toro` y `Memes es mal ramo`. La comparación normaliza
  mayúsculas, espacios y tildes, así que `"  MATIAS TORO "` también queda bloqueado.

Dos decisiones que vale la pena explicar:

- **`id` numérico.** La interfaz `Post` del enunciado exige `id: number`, pero Mongo
  entrega un `_id` de tipo `ObjectId`. Se guarda un contador aparte y un hook
  `pre('save')` asigna el siguiente número. Es atómico (`$inc`), así que dos POST
  simultáneos nunca reciben el mismo id.
- **`toJSON` transformado.** Se eliminan `_id` y `__v` y las fechas salen como string
  ISO, de modo que la respuesta calza exactamente con la interfaz que espera el frontend.

## P2 — Endpoint `api/threads`

| Archivo | Qué hace |
|---|---|
| [backend/src/controllers/threads.ts](backend/src/controllers/threads.ts) | `GET` y `POST` de `/api/threads` |
| [backend/src/app.ts](backend/src/app.ts) | Monta el router en `/api/threads` |
| [frontend/src/services/threads.ts](frontend/src/services/threads.ts) | `getAll()` y `create()` apuntando al backend propio |

- `GET /api/threads` → todos los posts con `thread === null`, ordenados por id.
- `POST /api/threads` → crea un thread (`thread: null`, `parent: null`) y responde `201`.

El formulario manda `author: ''` cuando el campo va vacío; el controlador lo
convierte a `null` para respetar el `string | null` de la interfaz.

## P3 — Endpoint `api/thread/:id`

| Archivo | Qué hace |
|---|---|
| [backend/src/controllers/thread.ts](backend/src/controllers/thread.ts) | `GET` y `POST` de `/api/thread/:id` |
| [backend/src/app.ts](backend/src/app.ts) | Monta el router en `/api/thread` |
| [frontend/src/services/threads.ts](frontend/src/services/threads.ts) | `getThread()` y `createComment()` |

- `GET /api/thread/:id` → `{ thread, comments }`, la misma forma que ya consumía
  `Thread.tsx` del lab anterior.
- `POST /api/thread/:id` → agrega un comentario con `thread = :id`. Acepta `parent`
  opcional para responder a otro post.

Validaciones extra: el thread debe existir (404), el `:id` debe ser numérico (400),
y si viene `parent` se comprueba que exista y que pertenezca a este mismo thread (400).

## P4 — Middlewares de manejo de errores

| Archivo | Qué hace |
|---|---|
| [backend/src/utils/middleware.ts](backend/src/utils/middleware.ts) | `errorHandler`, `unknownEndpoint`, `requestLogger`, clase `ApiError` |
| [backend/src/app.ts](backend/src/app.ts) | Los monta en orden (el `errorHandler` va al final) |
| [frontend/src/services/threads.ts](frontend/src/services/threads.ts) | Traduce el error del backend al mensaje del toast |

El `errorHandler` central responde **siempre JSON** y cubre:

| Situación | Respuesta |
|---|---|
| Validación al crear threads y comentarios (P1) | `400` con el mensaje concreto |
| Id mal formado (`/api/thread/abc`) | `400 malformatted id` |
| JSON malformado en el body | `400` |
| Índice único duplicado | `409` |
| Errores propios (`ApiError`) | su status (404, 400, …) |
| Cualquier excepción no prevista | `500`, sin que se caiga el proceso |

`unknownEndpoint` está montado en `/api` para que una URL mal escrita devuelva JSON
y no el `index.html` del SPA — si no, el frontend recibiría HTML donde espera datos.

Del lado del cliente, `toReadableError()` extrae el mensaje real del backend, así el
toast muestra *"El contenido no puede exceder los 300 caracteres"* en vez del genérico
*"Request failed with status code 400"* de axios.

## P5 — Endpoint `PUT api/posts/:id`

| Archivo | Qué hace |
|---|---|
| [backend/src/controllers/posts.ts](backend/src/controllers/posts.ts) | `PUT` (y un `GET` de apoyo) de `/api/posts/:id` |
| [backend/src/app.ts](backend/src/app.ts) | Monta el router en `/api/posts` |
| [frontend/src/services/threads.ts](frontend/src/services/threads.ts) | `update()` |
| [frontend/src/components/PostBox.tsx](frontend/src/components/PostBox.tsx) | Ya lo usaba para likes/dislikes (sin cambios) |

Sobrescribe la publicación con el objeto recibido, tal como indica la nota del
enunciado. Se ignoran a propósito los campos de identidad (`id`, `thread`, `parent`,
`createdAt`) para que una copia mal armada del cliente no pueda mover un comentario
de thread ni reescribir su fecha. `runValidators: true` mantiene vigentes las
restricciones de P1 también en la actualización, y un `likes: "muchos"` se rechaza
con 400 antes de tocar la base de datos.

## P6 — Deploy

**Preparado, pero no ejecutado**: subir al servidor requiere las credenciales SSH de
`fullstack@fullstack.dcc.uchile.cl` y el puerto asignado a tu número de integrante,
que no tengo. El código y los scripts quedaron listos para correrlo.

| Archivo | Qué hace |
|---|---|
| [backend/scripts/build-ui.mjs](backend/scripts/build-ui.mjs) | `npm run build:ui`: compila el frontend y copia `frontend/dist` → `backend/dist` |
| [backend/package.json](backend/package.json) | Scripts `build:ui`, `build`, `start` |
| [backend/src/app.ts](backend/src/app.ts) | Sirve el SPA y hace el fallback de rutas |
| [backend/.env.example](backend/.env.example) | Plantilla del `.env` de producción |
| [frontend/vite.config.ts](frontend/vite.config.ts) | `base: '/threads/'` y proxy de `/api` en desarrollo |

El script `build:ui` hace lo mismo que el `rm -rf` + `cp -r` del enunciado, pero
escrito en Node para que funcione igual en Windows y en el servidor.

Como el router del frontend usa `basename="/threads"`, el backend sirve los estáticos
bajo `/threads`, redirige `/` → `/threads` y devuelve `index.html` para `/threads/*`
(así `/threads/5` funciona al recargar la página).

Pasos para desplegar:

```bash
# local
cd backend
npm run build:ui          # compila el frontend -> backend/dist
npm run build             # compila el backend  -> backend/build
scp -P219 -r backend fullstack@fullstack.dcc.uchile.cl:<tu-carpeta>/

# en el servidor
cd <tu-carpeta>/backend
cat > .env <<'EOF'
MONGODB_URI=mongodb://fulls:fulls@fullstack.dcc.uchile.cl:27019
MONGODB_DBNAME=fullstack
PORT=70XX          # tu número de integrante
HOST=0.0.0.0
EOF
npm i
pm2 start npm --name <tu-carpeta>-70XX -- run start
pm2 save
```

Después verificar en `https://fullstack.dcc.uchile.cl:70XX/`.

> Al hacer `scp` no subas `node_modules`, `dist` ni `build` si ya existen localmente
> con dependencias de Windows: en el servidor se instalan con `npm i`.

---

## Verificación

Los endpoints se probaron contra una instancia real de MongoDB con 33 casos que
cubren P1–P5: creación de threads y comentarios, las tres restricciones del schema
(incluyendo variantes en mayúsculas y sin tildes de los nombres prohibidos), ids
inexistentes y mal formados, `parent` cruzado entre threads, sobrescritura vía PUT,
JSON malformado y rutas desconocidas. También se verificó el build de producción:
`/` redirige a `/threads`, los assets se sirven con la base correcta y `/threads/1`
resuelve por el fallback del SPA.

## Cambios menores fuera del enunciado

- [frontend/src/pages/Threads.tsx](frontend/src/pages/Threads.tsx) y
  [frontend/src/pages/Thread.tsx](frontend/src/pages/Thread.tsx): faltaba la prop
  `key` en los `.map()`. Sin ella React reutiliza mal los nodos al agregar un post
  nuevo a la lista.
