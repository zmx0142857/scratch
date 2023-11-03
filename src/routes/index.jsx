import { createEffect, createSignal, onCleanup } from 'solid-js'
import Toolbar from '~/components/Toolbar'
import Painter from '~/utils/Painter'
import './index.css'

const { events } = Painter

const Home = () => {
  const [canvas, setCanvas] = createSignal()
  const [painter, setPainter] = createSignal()
  const [historyLength, setHistoryLength] = createSignal(0)
  const [undoLength, setUndoLength] = createSignal(0)

  createEffect(() => {
    const painter = Painter({
      canvas: canvas(),
      onChange(type, ...args) {
        switch (type) {
          case events.historyLength: return setHistoryLength(...args)
          case events.undoLength: return setUndoLength(...args)
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
      <div className="main-toolbar">
        <Toolbar painter={painter} historyLength={historyLength} undoLength={undoLength} />
      </div>
    </main>
  )
}

export default Home
