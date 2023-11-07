import clsx from 'clsx'
import { For, Show, createEffect, createMemo, createSignal } from 'solid-js'
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

  const operator = (method, options = {}) => () => {
    if (options.hide !== false)
      hideDropdown()
    painter()[method]?.()
    // if (method === 'clear')
    //   setLogs([])
  }

  const toggleDropdown = (type, { items = () => [], style } = {}) => (e) => {
    if (!e.target)
      return
    const padding = 10
    const left = e.target.getBoundingClientRect().left - e.target.parentElement.getBoundingClientRect().left + padding
    const data = dropdown()
    setDropdown({
      show: type === data.type ? !data.show : true,
      type,
      style: {
        left: `${left}px`,
        transform: 'translateX(-50%)',
        ...style,
      },
      items,
    })
  }

  return (
    <div className="c-toolbar g-center">
      {/* icons & buttons */}
      <span class={clsx('c-toolbar-item mdi mdi-undo', { disabled: !historyLength() })} title={i18n().toolbar.undo} onClick={operator('undo')} />
      <span class={clsx('c-toolbar-item mdi mdi-redo', { disabled: !undoLength() })} title={i18n().toolbar.redo} onClick={operator('redo')} />
      <span class="c-toolbar-item mdi mdi-cancel" title={i18n().toolbar.clear} onClick={operator('clear')} />
      <span class="c-toolbar-item mdi mdi-download"
        title={i18n().toolbar.export}
        onClick={toggleDropdown('export', {
          items: () => [
            {
              title: i18n().toolbar.exportPngHint,
              onClick: operator('exportPng'),
              children: i18n().toolbar.exportPng,
            },
            {
              onClick: operator('exportHistory'),
              children: i18n().toolbar.exportHistory,
            },
          ],
        })}
      />
      <span class="c-toolbar-item c-toolbar-item-zoom"
        title={i18n().toolbar.zoom}
        onClick={toggleDropdown('zoom', {
          style: { display: 'flex' },
          items: () => [
            {
              onClick: operator('zoomIn', { hide: false }),
              children: <span class={clsx('mdi mdi-plus', { disabled: canvasTransform().scale >= maxZoom })} title={i18n().toolbar.zoomIn} />,
            },
            {
              onClick: operator('zoomOut', { hide: false }),
              children: <span class={clsx('mdi mdi-minus', { disabled: canvasTransform().scale <= minZoom })} title={i18n().toolbar.zoomOut} />,
            },
            {
              onClick: operator('zoomReset'),
              children: i18n().toolbar.zoomReset,
            },
          ],
        })}
      >
        {scale}%
      </span>
      {/* dropdown */}
      <Show when={dropdown().show}>
        <div class="c-toolbar-dropdown" style={dropdown().style}>
          <For each={dropdown().items()}>
            {item => (
              <div class="c-toolbar-dropdown-item"
                title={item.title}
                onClick={item.onClick}
              >
                {item.children}
              </div>
            )}
          </For>
        </div>
      </Show>
      {/* <div class="c-toolbar-logs">
        <For each={logs()}>
          {item => <div>{item}</div>}
        </For>
      </div> */}
    </div>
  )
}
