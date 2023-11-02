export const commandEnum = {
  stroke: 0,
  beginPath: 1,
  moveTo: 2,
  lineTo: 3,
  clearRect: 4,
}
// 逆映射
Object.entries(commandEnum).forEach(([k, v]) => commandEnum[v] = k)

export const commandChangeEnum = {
  historyLength: 0,
  undoLength: 1,
}

export const commandManager = ({ ctx, canvas, onChange }) => {
  const history = []
  const undoStack = []
  let endCommand = [0]
  let buf = []
  let timer
  const endWith = (...args) => {
    endCommand = args
  }
  const push = (...args) => {
    clearTimeout(timer)
    execCommand(args)
    buf.push(args)
    timer = setTimeout(saveBuf, 300)
  }
  const saveBuf = () => {
    clearTimeout(timer)
    execCommand(endCommand)
    buf.push(endCommand)
    history.push(buf)
    buf = []
    onChange(commandChangeEnum.historyLength, history.length)
  }
  const exec = (...args) => {
    execCommand(args)
  }
  const execCommand = ([id, ...args]) => {
    const name = commandEnum[id]
    name && ctx[name]?.(...args)
  }
  const execBuf = (buf) => {
    buf.forEach(execCommand)
  }
  const replay = () => {
    history.forEach(execBuf)
  }
  const clearHistory = () => {
    history.length = 0
    undoStack.length = 0
    onChange(commandChangeEnum.historyLength, history.length)
    onChange(commandChangeEnum.undoLength, undoStack.length)
  }
  const blank = (shouldSave = true) => {
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)
    if (shouldSave) {
      if (buf.length) saveBuf()
      history.push([[commandEnum.clearRect, 0, 0, width, height]])
      onChange(commandChangeEnum.historyLength, history.length)
    }
  }
  const undo = () => {
    blank(false)
    const lastAction = history.pop()
    if (lastAction) {
      undoStack.push(lastAction)
      onChange(commandChangeEnum.historyLength, history.length)
      onChange(commandChangeEnum.undoLength, undoStack.length)
      replay()
    }
  }
  const redo = () => {
    const lastAction = undoStack.pop()
    if (lastAction) {
      execBuf(lastAction)
      history.push(lastAction)
      onChange(commandChangeEnum.historyLength, history.length)
      onChange(commandChangeEnum.undoLength, undoStack.length)
    }
  }
  return {
    endWith,
    saveBuf,
    exec,
    push,
    replay,
    blank,
    clearHistory,
    undo,
    redo,
  }
}
