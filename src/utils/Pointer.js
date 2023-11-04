import { commands, events } from './config'
import { canvasTransform } from '~/store'

// 鼠标、触摸事件
const Pointer = (painter) => {
  let clickTimer

  const getXY = (e) => {
    const rect = painter.canvas.getBoundingClientRect()
    const { scale } = canvasTransform()
    return [
      (e.clientX - rect.left) / scale,
      (e.clientY - rect.top) / scale,
    ]
  }

  const onPointerDown = (e) => {
    const { history } = painter
    let isMove = false
    const [x, y] = getXY(e)
    history.clearAction()
    history.perform([commands.beginPath]) // 调用 history.perform 渐进地构建一个动作 (action)
    history.perform([commands.moveTo, x, y])

    const onPointerMove = (e) => {
      isMove = true
      const [x, y] = getXY(e)
      history.perform([commands.lineTo, x, y])
      history.perform([commands.stroke], false) // shouldSave 为 false 时, 仅执行指令, 但不保存到 action
      history.perform([commands.beginPath], false)
      history.perform([commands.moveTo, x, y], false)
    }

    const onPointerUp = (e) => {
      if (isMove) {
        history.perform([commands.stroke])
        history.pushHistory() // 完成构建, 将 action 保存到 history 中
        painter.onChange?.(events.dragEnd, e)
      } else {
        history.clearAction() // 取消刚刚构建的 action
        if (clickTimer) {
          clearTimeout(clickTimer)
          clickTimer = undefined
          painter.onChange?.(events.doubleClick, e)
        } else {
          clickTimer = setTimeout(() => {
            clickTimer = undefined
            painter.onChange?.(events.click, e)
          }, 200)
        }
      }
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  }

  const init = () => {
    painter.canvas.addEventListener('pointerdown', onPointerDown)
  }

  const destroy = () => {
    painter.canvas.removeEventListener('pointerdown', onPointerDown)
  }

  return {
    init,
    destroy,
  }
}

export default Pointer
