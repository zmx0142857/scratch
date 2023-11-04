import History from './History'
import Palette from './Palette'
import Pointer from './Pointer'
import Zoom from './Zoom'
import { commands, events } from './config'
import { setHistoryLength, setShowToolbar, setUndoLength } from '~/store'

// 画布管理
const Painter = ({ canvas }) => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const painter = {
    canvas,
    ctx: canvas.getContext('2d'),
    components: [],
  }

  const addComponent = (Constructor, name) => {
    const component = Constructor(painter)
    painter.components.push(component)
    if (name)
      painter[name] = component
    return component
  }

  const history = addComponent(History, 'history')
  const pointer = addComponent(Pointer, 'pointer')
  const palette = addComponent(Palette, 'palette')
  const zoom = addComponent(Zoom, 'zoom')

  const clear = (shouldSave = true) => {
    const { width, height } = canvas
    // painter.ctx.clearRect(0, 0, width, height)
    painter.ctx.fillRect(0, 0, width, height)
    palette.paintBg()
    if (shouldSave)
      history.pushHistory([[commands.clearRect, 0, 0, width, height]])
  }

  const repaint = () => {
    clear(false)
    history.performHistory()
  }

  const undo = () => {
    const action = history.popHistory()
    if (action) {
      clear(false)
      history.pushUndo(action)
      history.performHistory()
    }
  }

  const redo = () => {
    const action = history.popUndo()
    if (action) {
      history.performAction(action)
      history.pushHistory(action, false)
    }
  }

  const onBeforeUnload = (e) => {
    e.preventDefault()
    e.returnValue = ''
  }

  const exportPng = (filename = 'export.png') => {
    const a = document.createElement('a')
    a.href = canvas.toDataURL()
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const init = () => {
    painter.components.forEach(component => component.init?.())
    // 关闭窗口前, 提示用户保存数据
    window.addEventListener('beforeunload', onBeforeUnload)
  }

  const destroy = () => {
    painter.components.forEach(component => component.destroy?.())
    window.removeEventListener('beforeunload', onBeforeUnload)
  }

  const onChange = (type, ...args) => {
    // console.log('onChange', type)
    switch (type) {
      case events.historyLength: return setHistoryLength(...args)
      case events.undoLength: return setUndoLength(...args)
      case events.click: return setShowToolbar(show => !show)
      case events.theme: return repaint()
      default: break
    }
  }

  Object.assign(painter, {
    destroy,
    clear,
    undo,
    redo,
    repaint,
    onChange,
    exportPng,
    ...zoom,
  })

  init() // 在 init 执行前, painter
  return painter
}

Painter.events = events

export default Painter
