import { createSignal } from 'solid-js'
import { bgTypes } from '~/utils/config'

const [historyLength, setHistoryLength] = createSignal(0) // 历史记录长度
const [undoLength, setUndoLength] = createSignal(0) // 撤回记录长度
const [canvasTransform, setCanvasTransform] = createSignal({ x: 0, y: 0, scale: 1, transition: undefined }) // 画布缩放
const [bgType, setBgType] = createSignal(bgTypes.mesh) // 画布背景
const [showToolbar, setShowToolbar] = createSignal(true) // 显示工具栏

let canvasTransformTimer
const animCanvasTransform = (transform) => {
  setCanvasTransform({ ...transform, transition: true })
  clearTimeout(canvasTransformTimer)
  canvasTransformTimer = setTimeout(() => {
    setCanvasTransform(transform)
  }, 200)
}

export {
  historyLength,
  setHistoryLength,
  undoLength,
  setUndoLength,
  canvasTransform,
  setCanvasTransform,
  animCanvasTransform,
  bgType,
  setBgType,
  showToolbar,
  setShowToolbar,
}
