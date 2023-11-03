import { createSignal } from 'solid-js'

const [historyLength, setHistoryLength] = createSignal(0)
const [undoLength, setUndoLength] = createSignal(0)

export {
  historyLength,
  setHistoryLength,
  undoLength,
  setUndoLength,
}
