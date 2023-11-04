import clsx from 'clsx'
import { createMemo, createSignal, onCleanup } from 'solid-js'
import { animCanvasTransform, canvasTransform, setCanvasTransform } from '~/store'
import { between } from '~/utils'
import './index.css'

const Scrollbar = () => {
  const [vertical, setVertical] = createSignal()
  const [horizontal, setHorizontal] = createSignal()

  const halfBlank = (scale, size) => {
    return (1 - 1 / scale) * size / 2 | 0
  }

  const transform = createMemo(() => {
    const { x, y, scale } = canvasTransform()
    const width = horizontal()?.parentElement.offsetWidth || 0
    const height = vertical()?.parentElement.offsetHeight || 0
    const isZoomIn = scale > 1
    return {
      isZoomIn,
      size: isZoomIn ? `${parseInt(100 / scale)}%` : undefined,
      top: isZoomIn ? `translateY(${halfBlank(scale, height) - y}px)` : undefined,
      left: isZoomIn ? `translateX(${halfBlank(scale, width) - x}px)` : undefined,
    }
  })

  const onVerticalDown = (e) => {
    const el = e.target
    el.classList.add('active')
    const dy = el.offsetTop - e.clientY
    const { x, y, scale } = canvasTransform()
    const maxY = halfBlank(scale, el.parentElement.offsetHeight)
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
    const maxX = halfBlank(scale, el.parentElement.offsetWidth)
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
    if (!transform().isZoomIn)
      return
    const { shiftKey, deltaY } = e
    const { x, y, scale } = canvasTransform()
    if (shiftKey) {
      const el = horizontal()
      const maxX = halfBlank(scale, el.parentElement.offsetWidth)
      const newX = between(x - el.offsetLeft - deltaY, -maxX, maxX)
      animCanvasTransform({ x: newX, y, scale })
    } else {
      const el = vertical()
      const maxY = halfBlank(scale, el.parentElement.offsetHeight)
      const newY = between(y - el.offsetTop - deltaY, -maxY, maxY)
      animCanvasTransform({ x, y: newY, scale })
    }
  }

  document.addEventListener('wheel', onWheel)
  onCleanup(() => {
    document.removeEventListener('wheel', onWheel)
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
