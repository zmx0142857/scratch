import History from './History'
import Palette from './Palette'
import Pointer from './Pointer'
import Zoom from './Zoom'
import { commands, events } from './config'
import { download } from '.'
import { historyLength, setHistoryLength, setShowToolbar, setUndoLength } from '~/store'

// 画布管理
const Painter = ({ canvas }) => {
  const dpr = window.devicePixelRatio
  // const dpr = 1
  const width = window.innerWidth
  const height = window.innerHeight
  canvas.width = width * dpr
  canvas.height = height * dpr
  Object.assign(canvas.style, {
    width: `${width}px`,
    height: `${height}px`,
  })
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
    palette.paintBg()
    if (shouldSave) {
      history.pushHistory([
        [commands.custom, 'palette', 'paintBg'],
      ])
    }
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

  // 关闭窗口前, 提示用户保存数据
  const onBeforeUnload = (e) => {
    if (historyLength()) {
      e.preventDefault()
      e.returnValue = ''
    }
  }

  const exportPng = () => {
    download({ url: canvas.toDataURL() })
  }

  const exportHistory = () => {
    const str = JSON.stringify(history.getHistory())
    download({ str })
  }

  const init = () => {
    painter.components.forEach(component => component.init?.())
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
    exportHistory,
    ...zoom,
  })

  init() // 在 init 执行前, painter
  return painter
}

Painter.events = events

export default Painter
