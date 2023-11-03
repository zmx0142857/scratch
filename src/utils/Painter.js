import PainterHistory from './PainterHistory'

const commands = {
  stroke: 0,
  beginPath: 1,
  moveTo: 2,
  lineTo: 3,
  clearRect: 4,
}
// 逆映射
Object.entries(commands).forEach(([k, v]) => commands[v] = k)

const Painter = ({ canvas, onChange }) => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()
  const history = PainterHistory({ onChange })
  const mediaMatch = window.matchMedia('(prefers-color-scheme: dark)')

  const performTick = (tick, shouldSave = true) => {
    const name = commands[tick[0]]
    name && ctx[name]?.(...tick.slice(1))
    if (shouldSave)
      history.pushAction(tick)
  }

  const performAction = (action) => {
    action.forEach(performTick)
  }

  const performHistory = () => {
    history.getHistory().forEach(performAction)
  }

  const blank = (shouldSave = true) => {
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)
    if (shouldSave)
      history.pushHistory([[commands.clearRect, 0, 0, width, height]])
  }

  const undo = () => {
    const action = history.popHistory()
    if (action) {
      blank(false)
      history.pushUndo(action)
      performHistory()
    }
  }

  const redo = () => {
    const action = history.popUndo()
    if (action) {
      performAction(action)
      history.pushHistory(action)
    }
  }

  const getXY = (e) => {
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return [x, y]
  }

  const onMouseDown = (e) => {
    let isMove = false
    const [x, y] = getXY(e)
    performTick([commands.beginPath])
    performTick([commands.moveTo, x, y])

    const onMouseMove = (e) => {
      isMove = true
      const [x, y] = getXY(e)
      performTick([commands.lineTo, x, y])
      performTick([commands.stroke], false)
      performTick([commands.beginPath], false)
      performTick([commands.moveTo, x, y], false)
    }

    const onClick = (e) => {
      history.clearAction()
    }

    const onDragEnd = (e) => {
      performTick([commands.stroke])
      history.pushHistory()
    }

    const onMouseUp = (e) => {
      if (isMove)
        onDragEnd(e)
      else
        onClick(e)
      document.removeEventListener('pointermove', onMouseMove)
      document.removeEventListener('pointerup', onMouseUp)
    }
    document.addEventListener('pointermove', onMouseMove)
    document.addEventListener('pointerup', onMouseUp)
  }

  const onMediaChange = (e) => {
    // console.log('isDark', e.matches)
    ctx.strokeStyle = e.matches ? '#f0f0f0' : '#222'
  }

  const destroy = () => {
    canvas.removeEventListener('pointerdown', onMouseDown)
    mediaMatch.removeEventListener('change', onMediaChange)
  }

  onMediaChange(mediaMatch)
  mediaMatch.addEventListener('change', onMediaChange)
  canvas.addEventListener('pointerdown', onMouseDown)

  return {
    destroy,
    blank,
    undo,
    redo,
  }
}

Painter.events = PainterHistory.events

export default Painter
