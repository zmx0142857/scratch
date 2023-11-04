import clsx from 'clsx'
import { createMemo } from 'solid-js'
import { canvasTransform, historyLength, undoLength } from '~/store'
import { maxZoom, minZoom } from '~/utils/config'
import './index.css'

export default function Toolbar({ painter }) {
  const scale = createMemo(() => {
    return parseInt(canvasTransform().scale * 100)
  })
  return (
    <div className="c-toolbar g-center">
      <i class={clsx('mdi mdi-undo', { disabled: !historyLength() })} title="Undo" onClick={() => painter().undo()} />
      <i class={clsx('mdi mdi-redo', { disabled: !undoLength() })} title="Redo" onClick={() => painter().redo()} />
      <i class="mdi mdi-cancel" title="Clear" onClick={() => painter().clear()} />
      <i class="mdi mdi-download" title="Export PNG" onClick={() => painter().exportPng()} />
      <i class={clsx('mdi mdi-plus', { disabled: canvasTransform().scale >= maxZoom })} title="Zoom In" onClick={() => painter().zoomIn()} />
      <i class={clsx('mdi mdi-minus', { disabled: canvasTransform().scale <= minZoom })} title="Zoom Out" onClick={() => painter().zoomOut()} />
      <span class="btn-zoom-reset" title="Zoom Reset" onClick={() => painter().zoomReset()}>{scale}%</span>
    </div>
  )
}
