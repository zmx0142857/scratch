import { commands, events } from './config'

// 画布历史
const History = ({ ctx, onChange }) => {
  let currentAction = []
  const history = []
  const undo = []

  const pushAction = (tick) => {
    currentAction.push(tick)
  }

  const pushHistory = (action) => {
    history.push(action || currentAction)
    currentAction = []
    onChange?.(events.historyLength, history.length)
  }

  const pushUndo = (action) => {
    undo.push(action)
    onChange?.(events.undoLength, undo.length)
  }

  const popHistory = () => {
    const res = history.pop()
    onChange?.(events.historyLength, history.length)
    return res
  }

  const popUndo = () => {
    const res = undo.pop()
    onChange?.(events.undoLength, undo.length)
    return res
  }

  const clearAction = () => {
    currentAction = []
  }

  const clearHistory = () => {
    history.length = 0
    onChange?.(events.historyLength, history.length)
  }

  const clearUndo = () => {
    undo.length = 0
    onChange?.(events.undoLength, undo.length)
  }

  const perform = (tick, shouldSave = true) => {
    const name = commands[tick[0]]
    name && ctx[name]?.(...tick.slice(1))
    if (shouldSave)
      pushAction(tick)
  }

  const performAction = (action) => {
    action.forEach(perform)
  }

  const performHistory = () => {
    history.forEach(performAction)
  }

  const destroy = () => {
    clearAction()
    clearHistory()
    clearUndo()
  }

  return {
    pushAction,
    pushHistory,
    pushUndo,
    popHistory,
    popUndo,
    clearAction,
    clearHistory,
    clearUndo,
    perform,
    performAction,
    performHistory,
    destroy,
  }
}

export default History
