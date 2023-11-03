const events = {
  historyLength: 0,
  undoLength: 1,
}

const PainterHistory = ({ onChange }) => {
  let currentAction = []
  const history = []
  const undo = []

  const getHistory = () => history

  const pushAction = (tick) => {
    currentAction.push(tick)
  }

  const pushHistory = (action) => {
    history.push(action || currentAction)
    currentAction = []
    onChange(events.historyLength, history.length)
  }

  const pushUndo = (action) => {
    undo.push(action)
    onChange(events.undoLength, undo.length)
  }

  const popHistory = () => {
    const res = history.pop()
    onChange(events.historyLength, history.length)
    return res
  }

  const popUndo = () => {
    const res = undo.pop()
    onChange(events.undoLength, undo.length)
    return res
  }

  const clearAction = () => {
    currentAction = []
  }

  const clearHistory = () => {
    history.length = 0
    onChange(events.historyLength, history.length)
  }

  const clearUndo = () => {
    undo.length = 0
    onChange(events.undoLength, undo.length)
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
    getHistory,
  }
}

PainterHistory.events = events

export default PainterHistory
