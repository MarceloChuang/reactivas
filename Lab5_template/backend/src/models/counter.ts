// =============================================================
// P1 - Apoyo al schema
// -------------------------------------------------------------
// La interfaz Post del enunciado exige `id: number`, pero MongoDB
// entrega un `_id` de tipo ObjectId. Para respetar el contrato del
// frontend guardamos un contador atomico por coleccion y lo usamos
// como id numerico autoincremental.
// =============================================================
import mongoose from 'mongoose'

// El _id del contador es el nombre de la coleccion ("posts"), no un
// ObjectId, por eso se declara explicitamente como string.
export interface CounterDocument {
  _id: string
  seq: number
}

const counterSchema = new mongoose.Schema<CounterDocument>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
})

const Counter = mongoose.model<CounterDocument>('Counter', counterSchema)

// findByIdAndUpdate con $inc es atomico: aunque lleguen dos POST en
// paralelo, cada uno recibe un id distinto.
export const getNextSequence = async (name: string): Promise<number> => {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  )
  return counter.seq
}

export default Counter
