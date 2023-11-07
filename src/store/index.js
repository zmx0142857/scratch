import { createSignal } from 'solid-js'
import { bgTypes } from '~/utils/config'
import enUS from '~/i18n/en-US'

const [historyLength, setHistoryLength] = createSignal(0) // 历史记录长度
const [undoLength, setUndoLength] = createSignal(0) // 撤回记录长度
const [canvasTransform, setCanvasTransform] = createSignal({ x: 0, y: 0, scale: 1, transition: undefined }) // 画布缩放
const [bgType, setBgType] = createSignal(bgTypes.mesh) // 画布背景
const [showToolbar, setShowToolbar] = createSignal(true) // 显示工具栏
const [i18n, setI18n] = createSignal(enUS)
const [logs, setLogs] = createSignal([])

let canvasTransformTimer
const animCanvasTransform = (transform) => {
  setCanvasTransform({ ...transform, transition: true })
  clearTimeout(canvasTransformTimer)
  canvasTransformTimer = setTimeout(() => {
    setCanvasTransform(transform)
  }, 200)
}

const addLog = (log) => {
  setLogs([...logs(), log])
}

const init = async () => {
  const { language } = window.navigator
  if (['en-US', 'zh-CN'].includes(language))
    import(`../i18n/${language}.js`).then(res => setI18n(res.default)).catch(console.error)
}

init()

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
  /** @type {typeof enUS} */
  i18n,
  logs,
  addLog,
  setLogs,
}
