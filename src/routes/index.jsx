import { createEffect, createSignal, onCleanup } from 'solid-js'
import clsx from 'clsx'
import Toolbar from '~/components/Toolbar'
import Painter from '~/utils/Painter'
import { setHistoryLength, setUndoLength } from '~/store'
import './index.css'

const { events } = Painter

const Home = () => {
  const [canvas, setCanvas] = createSignal()
  const [painter, setPainter] = createSignal()
  const [showToolbar, setShowToolbar] = createSignal(true)

  createEffect(() => {
    const painter = Painter({
      canvas: canvas(),
      onChange(type, ...args) {
        // console.log('onChange', type)
        switch (type) {
          case events.historyLength: return setHistoryLength(...args)
          case events.undoLength: return setUndoLength(...args)
          case events.click: return setShowToolbar(show => !show)
          default: break
        }
      },
    })
    setPainter(painter)
    onCleanup(() => {
      painter.destroy()
    })
  })

  return (
    <main class="main g-full">
      <canvas class="main-canvas" ref={setCanvas} />
      <div className={clsx('main-toolbar', { hidden: !showToolbar() })}>
        <Toolbar painter={painter} />
      </div>
    </main>
  )
}

export default Home
