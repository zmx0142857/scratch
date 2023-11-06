import clsx from 'clsx'
import { createMemo, createSignal, onCleanup } from 'solid-js'
import { animCanvasTransform, canvasTransform, setCanvasTransform } from '~/store'
import { between, halfBlank } from '~/utils'
import './index.css'

const Scrollbar = ({ painter }) => {
  const [vertical, setVertical] = createSignal()
  const [horizontal, setHorizontal] = createSignal()

  const transform = createMemo(() => {
    const { x, y, scale } = canvasTransform()
    const width = horizontal()?.parentElement.offsetWidth || 0
    const height = vertical()?.parentElement.offsetHeight || 0
    const isZoomIn = scale > 1
    const k = 1 / scale
    return {
      isZoomIn,
      size: isZoomIn ? `${parseInt(100 * k)}%` : undefined,
      top: isZoomIn ? `translateY(${halfBlank(k, height) - y}px)` : undefined,
      left: isZoomIn ? `translateX(${halfBlank(k, width) - x}px)` : undefined,
    }
  })

  const onVerticalDown = (e) => {
    const el = e.target
    el.classList.add('active')
    const dy = el.offsetTop - e.clientY
    const { x, y, scale } = canvasTransform()
    const maxY = halfBlank(1 / scale, el.parentElement.offsetHeight)
    const onMove = (e) => {
      const newY = between(y - e.clientY - dy, -maxY, maxY)
      setCanvasTransform({ x, y: newY, scale })
    }
    const onUp = (e) => {
      el.classList.remove('active')
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const onHorizontalDown = (e) => {
    const el = e.target
    el.classList.add('active')
    const dx = el.offsetLeft - e.clientX
    const { x, y, scale } = canvasTransform()
    const maxX = halfBlank(1 / scale, el.parentElement.offsetWidth)
    const onMove = (e) => {
      const newX = between(x - e.clientX - dx, -maxX, maxX)
      setCanvasTransform({ x: newX, y, scale })
    }
    const onUp = (e) => {
      el.classList.remove('active')
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const onWheel = (e) => {
    const { shiftKey, ctrlKey, deltaY } = e
    const { x, y, scale } = canvasTransform()
    const { isZoomIn } = transform()
    if (ctrlKey) {
      e.preventDefault()
      if (deltaY < 0)
        painter().zoomIn()
      else if (deltaY > 0)
        painter().zoomOut()
    } else if (shiftKey) {
      if (!isZoomIn)
        return
      const el = horizontal()
      const maxX = halfBlank(1 / scale, el.parentElement.offsetWidth)
      const newX = between(x - el.offsetLeft - deltaY, -maxX, maxX)
      animCanvasTransform({ x: newX, y, scale })
    } else {
      if (!isZoomIn)
        return
      const el = vertical()
      const maxY = halfBlank(1 / scale, el.parentElement.offsetHeight)
      const newY = between(y - el.offsetTop - deltaY, -maxY, maxY)
      animCanvasTransform({ x, y: newY, scale })
    }
  }

  document.addEventListener('wheel', onWheel, { passive: false })
  onCleanup(() => {
    document.removeEventListener('wheel', onWheel, { passive: false })
  })

  return (
    <>
      <div class="c-scrollbar c-scrollbar-vertical">
        <div className={clsx('c-scrollbar-thumb', { transition: canvasTransform().transition })}
          draggable="false"
          style={{ height: transform().size, transform: transform().top }}
          onPointerDown={onVerticalDown}
          ref={setVertical}
        />
      </div>
      <div class="c-scrollbar c-scrollbar-horizontal">
        <div className={clsx('c-scrollbar-thumb', { transition: canvasTransform().transition })}
          draggable="false"
          style={{ width: transform().size, transform: transform().left }}
          onPointerDown={onHorizontalDown}
          ref={setHorizontal}
        />
      </div>
    </>
  )
}

export default Scrollbar
