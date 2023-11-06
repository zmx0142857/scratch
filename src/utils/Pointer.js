import { commands, events } from './config'
import { between, halfBlank } from '.'
import { animCanvasTransform, canvasTransform, setCanvasTransform } from '~/store'

// 鼠标、触摸事件
const Pointer = (painter) => {
  let clickTimer

  const getXY = (e) => {
    const rect = painter.canvas.getBoundingClientRect()
    const { scale } = canvasTransform()
    // e.preventDefault() // causes error thus stopped event propagation, see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
    return [
      (e.clientX - rect.left) / scale,
      (e.clientY - rect.top) / scale,
    ]
  }

  const touches = {}
  const moves = {}
  const addTouch = (e) => {
    touches[e.pointerId] = e
  }

  const removeTouch = (e) => {
    Object.keys(touches).forEach((key) => {
      if (Number(key) >= e.pointerId)
        delete touches[key]
    })
  }

  const addMove = (e) => {
    moves[e.pointerId] = e
  }

  let bounceTimer
  const bounceBack = () => {
    const { canvas } = painter
    const transform = canvasTransform()
    const k = 1 / transform.scale
    bounceTimer = setTimeout(() => {
      const maxX = halfBlank(k, canvas.width)
      const maxY = halfBlank(k, canvas.height)
      animCanvasTransform({
        x: between(transform.x, -maxX, maxX),
        y: between(transform.y, -maxY, maxY),
        scale: transform.scale,
      })
    }, 50)
  }

  let isMove = false
  let transform = {}
  const onPointerDown = (e) => {
    addTouch(e)
    addMove(e)
    transform = canvasTransform()
    const touchKeys = Object.keys(touches)
    const touchLen = touchKeys.length
    if (touchLen === 1) {
      if (e.target !== painter.canvas)
        return
      const { history } = painter
      const [x, y] = getXY(e)
      history.clearAction()
      history.perform([commands.beginPath]) // 调用 history.perform 渐进地构建一个动作 (action)
      history.perform([commands.moveTo, x, y])
    }
  }

  const onPointerMove = (e) => {
    const touchKeys = Object.keys(touches)
    const touchLen = touchKeys.length
    if (touchLen > 0)
      addMove(e)
    if (e.target !== painter.canvas)
      return
    if (touchLen === 1) {
      isMove = true
      const { history } = painter
      const [x, y] = getXY(e)
      history.perform([commands.lineTo, x, y])
      history.perform([commands.stroke], false) // shouldSave 为 false 时, 仅执行指令, 但不保存到 action
      history.perform([commands.beginPath], false)
      history.perform([commands.moveTo, x, y], false)
    } else if (touchLen === 2) {
      const data = {}
      const { clientX: t0x, clientY: t0y } = touches[touchKeys[0]]
      const { clientX: t1x, clientY: t1y } = touches[touchKeys[1]]
      const { clientX: m0x, clientY: m0y } = moves[touchKeys[0]] || {}
      const { clientX: m1x, clientY: m1y } = moves[touchKeys[1]] || {}

      // 画布缩放
      const rat = Math.abs(m1x - m0x) > Math.abs(m1y - m0y)
        ? (m1x - m0x) / (t1x - t0x)
        : (m1y - m0y) / (t1y - t0y)
      // TODO: 放大倍数较大时, 此处抖动怎么优化?
      data.scale = between(transform.scale * rat, 0.5, 10)

      // 画布位移
      const k = 1 / data.scale
      data.x = transform.x + (m0x - t0x) * k
      data.y = transform.y + (m0y - t0y) * k
      setCanvasTransform(data)
    }
  }

  const onPointerUp = (e) => {
    const touchKeys = Object.keys(touches)
    const touchLen = touchKeys.length
    if (touchLen > 0)
      removeTouch(e)

    if (e.target !== painter.canvas)
      return
    bounceBack()
    const { history } = painter
    if (touchLen === 1) {
      if (isMove) {
        // TODO: 移动端缩放时此处容易误触
        isMove = false
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
    } else {
      history.clearAction()
    }
  }

  const init = () => {
    const container = painter.canvas.parentElement
    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerUp)
  }

  const destroy = () => {
    const container = painter.canvas.parentElement
    container.removeEventListener('pointerdown', onPointerDown)
    container.removeEventListener('pointermove', onPointerMove)
    container.removeEventListener('pointerup', onPointerUp)
  }

  return {
    init,
    destroy,
  }
}

export default Pointer
