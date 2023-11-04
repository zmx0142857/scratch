import { commands, events } from './config'

// 画布历史
const History = (painter) => {
  let currentAction = []
  const history = []
  const undo = []

  const clearAction = () => {
    currentAction = []
  }

  const clearHistory = () => {
    history.length = 0
    painter.onChange?.(events.historyLength, history.length)
  }

  const clearUndo = () => {
    undo.length = 0
    painter.onChange?.(events.undoLength, undo.length)
  }

  const pushAction = (tick) => {
    currentAction.push(tick)
  }

  const pushHistory = (action, shouldClearUndo = true) => {
    history.push(action || currentAction)
    currentAction = []
    painter.onChange?.(events.historyLength, history.length)
    if (shouldClearUndo)
      clearUndo()
  }

  const pushUndo = (action) => {
    undo.push(action)
    painter.onChange?.(events.undoLength, undo.length)
  }

  const popHistory = () => {
    const res = history.pop()
    painter.onChange?.(events.historyLength, history.length)
    return res
  }

  const popUndo = () => {
    const res = undo.pop()
    painter.onChange?.(events.undoLength, undo.length)
    return res
  }

  const perform = (tick, shouldSave = true) => {
    const name = commands[tick[0]]
    name && painter.ctx[name]?.(...tick.slice(1))
    if (shouldSave)
      pushAction(tick)
  }

  const performAction = (action) => {
    action.forEach(perform)
  }

  const performHistory = () => {
    history.forEach(performAction)
  }

  const init = () => {}

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
    init,
    destroy,
  }
}

export default History
