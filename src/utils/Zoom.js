import { zooms } from './config'
import { animCanvasTransform, canvasTransform } from '~/store'

const Zoom = () => {
  const setTransform = (x, y, scale, newScale) => {
    const transform = {
      x: newScale <= 1 ? 0 : x * (1 - 1 / newScale) / (1 - 1 / scale) | 0,
      y: newScale <= 1 ? 0 : y * (1 - 1 / newScale) / (1 - 1 / scale) | 0,
      scale: newScale,
    }
    animCanvasTransform(transform)
  }

  const zoomIn = () => {
    const { x, y, scale } = canvasTransform()
    const newScale = zooms.find(v => v > scale)
    if (newScale)
      setTransform(x, y, scale, newScale)
  }

  const zoomOut = () => {
    const { x, y, scale } = canvasTransform()
    const newScale = zooms.findLast(v => v < scale)
    if (newScale)
      setTransform(x, y, scale, newScale)
  }

  const zoomReset = () => {
    animCanvasTransform({ x: 0, y: 0, scale: 1 })
  }

  return {
    zoomIn,
    zoomOut,
    zoomReset,
  }
}

export default Zoom
