import { commands, events } from './config'
import { between, halfBlank } from '.'
import { animCanvasTransform, canvasTransform, setCanvasTransform } from '~/store'

// 鼠标、触摸事件
const Pointer = (painter) => {
  const dpr = window.devicePixelRatio
  const downs = {}
  const moves = {}
  let clickTimer
  let scaleTimer
  let transform = {}
  let isMove = false

  const getXY = (e) => {
    const rect = painter.canvas.getBoundingClientRect()
    const { scale } = canvasTransform()
    return [
      (e.clientX - rect.left) * dpr / scale,
      (e.clientY - rect.top) * dpr / scale,
    ]
  }

  const addPointer = (touches, e) => {
    touches[e.pointerId] = e
  }

  const removePointer = (touches, e) => {
    Object.keys(touches).forEach((key) => {
      if (Number(key) >= e.pointerId)
        delete touches[key]
    })
  }

  const bounceBack = () => {
    const container = painter.canvas.parentElement
    const transform = canvasTransform()
    const k = 1 / transform.scale
    const maxX = halfBlank(k, container.offsetWidth)
    const maxY = halfBlank(k, container.offsetHeight)
    animCanvasTransform({
      x: between(transform.x, -maxX, maxX),
      y: between(transform.y, -maxY, maxY),
      scale: transform.scale,
    })
  }

  const onSingleDown = (e) => {
    const { history } = painter
    const [x, y] = getXY(e)
    history.clearAction()
    history.perform([commands.beginPath]) // 调用 history.perform 渐进地构建一个动作 (action)
    history.perform([commands.moveTo, x, y])
  }

  const onSingleMove = (e) => {
    if (scaleTimer)
      return
    const { history } = painter
    const [x, y] = getXY(e)
    history.perform([commands.lineTo, x, y])
    // addLog('stroke move')
    history.perform([commands.stroke], false) // shouldSave 为 false 时, 仅执行指令, 但不保存到 action
    history.perform([commands.beginPath], false)
    history.perform([commands.moveTo, x, y], false)
  }

  const onMultiMove = (touchKeys) => {
    // 避免缩放时误触造成意外的画线操作
    clearTimeout(scaleTimer)
    scaleTimer = setTimeout(() => {
      scaleTimer = undefined
    }, 100)

    const data = {}
    const { clientX: t0x, clientY: t0y } = downs[touchKeys[0]]
    const { clientX: t1x, clientY: t1y } = downs[touchKeys[1]]
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

  const onSingleUp = (e) => {
    const { history } = painter
    if (isMove) {
      if (scaleTimer)
        return
      // addLog('stroke up')
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
  }

  const onPointerDown = (e) => {
    addPointer(downs, e)
    addPointer(moves, e)
    const touchKeys = Object.keys(downs)
    const touchLen = touchKeys.length
    if (touchLen > 0)
      transform = canvasTransform()

    if (e.target !== painter.canvas)
      return

    if (touchLen === 1)
      onSingleDown(e)
  }

  const onPointerMove = (e) => {
    const touchKeys = Object.keys(downs)
    const touchLen = touchKeys.length
    if (touchLen > 0)
      addPointer(moves, e)

    if (e.target !== painter.canvas)
      return

    isMove = touchLen === 1

    if (touchLen === 1)
      onSingleMove(e)
    else if (touchLen === 2)
      onMultiMove(touchKeys)
  }

  const onPointerUp = (e) => {
    const touchKeys = Object.keys(downs)
    const touchLen = touchKeys.length
    removePointer(downs, e)
    removePointer(moves, e)

    if (e.target !== painter.canvas)
      return

    bounceBack()
    const { history } = painter
    if (touchLen === 1)
      onSingleUp(e)
    else
      history.clearAction()

    isMove = false
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
