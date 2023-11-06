import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import clsx from 'clsx'
import Toolbar from '~/components/Toolbar'
import Painter from '~/utils/Painter'
import { canvasTransform, showToolbar } from '~/store'
import Scrollbar from '~/components/Scrollbar'
import './index.css'

const { events } = Painter

const Home = () => {
  const [canvas, setCanvas] = createSignal()
  const [painter, setPainter] = createSignal()
  const transform = createMemo(() => {
    const { x, y, scale } = canvasTransform()
    return `scale(${scale}) translate(${x}px, ${y}px)`
  })

  createEffect(() => {
    const painter = Painter({
      canvas: canvas(),
    })
    setPainter(painter)
    onCleanup(() => {
      painter.destroy()
    })
  })

  return (
    <main class="main g-full">
      <div class="main-container g-full">
        <canvas class={clsx('main-canvas', { transition: canvasTransform().transition })}
          style={{ transform: transform() }}
          ref={setCanvas}
        />
      </div>
      <div className={clsx('main-toolbar', { hidden: !showToolbar() })}>
        <Toolbar painter={painter} />
      </div>
      <Scrollbar />
    </main>
  )
}

export default Home
