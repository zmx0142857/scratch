import History from './History'
import Palette from './Palette'
import Pointer from './Pointer'
import { commands, events } from './config'

// 画布管理
const Painter = ({ canvas, onChange }) => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const ctx = canvas.getContext('2d')
  const history = History({ ctx, onChange })
  const palette = Palette({ ctx, onChange })
  const pointer = Pointer({ canvas, onChange, history })

  const clear = (shouldSave = true) => {
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)
    if (shouldSave)
      history.pushHistory([[commands.clearRect, 0, 0, width, height]])
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
      history.pushHistory(action)
    }
  }

  const onBeforeUnload = (e) => {
    e.preventDefault()
    e.returnValue = ''
  }

  const destroy = () => {
    history.destroy()
    palette.destroy()
    pointer.destroy()
    window.removeEventListener('beforeunload', onBeforeUnload)
  }

  // 关闭窗口前, 提示用户保存数据
  window.addEventListener('beforeunload', onBeforeUnload)

  return {
    destroy,
    clear,
    undo,
    redo,
  }
}

Painter.events = events

export default Painter
