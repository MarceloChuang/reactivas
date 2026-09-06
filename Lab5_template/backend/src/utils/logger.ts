// =============================================================
// Logger centralizado: evita usar console.log directamente y
// permite silenciar la salida facilmente si hiciera falta.
// =============================================================

const info = (...params: unknown[]) => {
  console.log(...params)
}

const error = (...params: unknown[]) => {
  console.error(...params)
}

export default { info, error }
