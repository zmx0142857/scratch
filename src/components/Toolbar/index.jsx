import clsx from 'clsx'
import { Show, createEffect, createMemo, createSignal } from 'solid-js'
import { canvasTransform, historyLength, i18n, showToolbar, undoLength } from '~/store'
import { maxZoom, minZoom } from '~/utils/config'
import './index.css'

export default function Toolbar({ painter }) {
  const scale = createMemo(() => {
    return parseInt(canvasTransform().scale * 100)
  })

  const [dropdown, setDropdown] = createSignal({
    show: false,
    type: '',
    style: {},
  })

  const hideDropdown = () => {
    setDropdown({
      ...dropdown(),
      show: false,
    })
  }

  createEffect(() => {
    if (dropdown().show && !showToolbar())
      hideDropdown()
  })

  const toggleDropdown = (e) => {
    if (!e.target)
      return
    const left = e.target.getBoundingClientRect().left - e.target.parentElement.getBoundingClientRect().left
    setDropdown({
      show: !dropdown().show,
      type: 'export',
      style: {
        left: `${left}px`,
      },
    })
  }

  const operator = method => () => {
    hideDropdown()
    painter()[method]?.()
  }

  return (
    <div className="c-toolbar g-center">
      {/* icons & buttons */}
      <span class={clsx('c-toolbar-item mdi mdi-undo', { disabled: !historyLength() })} title={i18n().toolbar.undo} onClick={operator('undo')} />
      <span class={clsx('c-toolbar-item mdi mdi-redo', { disabled: !undoLength() })} title={i18n().toolbar.redo} onClick={operator('redo')} />
      <span class="c-toolbar-item mdi mdi-cancel" title={i18n().toolbar.clear} onClick={operator('clear')} />
      <span class="c-toolbar-item mdi mdi-download" title={i18n().toolbar.export} onClick={toggleDropdown} />
      <span class={clsx('c-toolbar-item mdi mdi-plus', { disabled: canvasTransform().scale >= maxZoom })} title={i18n().toolbar.zoomIn} onClick={operator('zoomIn')} />
      <span class={clsx('c-toolbar-item mdi mdi-minus', { disabled: canvasTransform().scale <= minZoom })} title={i18n().toolbar.zoomOut} onClick={operator('zoomOut')} />
      <span class="c-toolbar-item c-toolbar-item-zoom-reset" title={i18n().toolbar.zoomReset} onClick={operator('zoomReset')}>{scale}%</span>
      {/* dropdown */}
      <Show when={dropdown().show}>
        <div class="c-toolbar-dropdown" style={dropdown().style}>
          <div class="c-toolbar-dropdown-item"
            title={i18n().toolbar.exportPngHint}
            onClick={operator('exportPng')}
          >
            {i18n().toolbar.exportPng}
          </div>
          <div class="c-toolbar-dropdown-item"
            onClick={operator('exportHistory')}
          >
            {i18n().toolbar.exportHistory}
          </div>
        </div>
      </Show>
    </div>
  )
}
