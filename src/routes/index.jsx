import { createEffect, createSignal, onCleanup } from 'solid-js'
import { Title } from 'solid-start'
// import Counter from '~/components/Counter'
import './index.css'
import { commandChangeEnum, commandEnum, commandManager } from './index.utils'

export default function Home() {
  const [canvas, setCanvas] = createSignal()
  const [color, setColor] = createSignal('#222')
  const [command, setCommand] = createSignal()
  const [historyLength, setHistoryLength] = createSignal(0)
  const [undoLength, setUndoLength] = createSignal(0)

  console.log('render')

  // setup color
  createEffect(() => {
    const mediaMatch = window.matchMedia('(prefers-color-scheme: dark)')
    function onMediaChange (e) {
      console.log('isDark', e.matches)
      setColor(e.matches ? '#f0f0f0' : '#222')
    }
    onMediaChange(mediaMatch)
    mediaMatch.addEventListener('change', onMediaChange)
    // return () => {
    //   mediaMatch.removeEventListener('change', onMediaChange)
    // }
  })

  // setup canvas
  createEffect(() => {
    const c = canvas()
    c.width = window.innerWidth
    c.height = window.innerHeight
    const ctx = c.getContext('2d')
    const rect = c.getBoundingClientRect()
    const command = commandManager({
      ctx,
      canvas: c,
      onChange (type, ...args) {
        if (type === commandChangeEnum.historyLength) {
          setHistoryLength(...args)
        } else if (type === commandChangeEnum.undoLength) {
          setUndoLength(...args)
        }
      }
    })
    setCommand(command)
    const getXY = (e) => {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      return [x, y]
    }
    const onMouseDown = (e) => {
      const [x, y] = getXY(e)
      ctx.strokeStyle = color()
      command.endWith(commandEnum.stroke)
      command.push(commandEnum.beginPath)
      command.push(commandEnum.moveTo, x, y)
      command.push(commandEnum.lineTo, x, y)
      command.exec(commandEnum.stroke)
      command.exec(commandEnum.beginPath)
      command.exec(commandEnum.moveTo, x, y)
      const onMouseMove = (e) => {
        const [x, y] = getXY(e)
        command.push(commandEnum.lineTo, x, y)
        command.exec(commandEnum.stroke)
        command.exec(commandEnum.beginPath)
        command.exec(commandEnum.moveTo, x, y)
      }
      const onMouseUp = (e) => {
        command.saveBuf()
        document.removeEventListener('pointermove', onMouseMove)
        document.removeEventListener('pointerup', onMouseUp)
      }
      document.addEventListener('pointermove', onMouseMove)
      document.addEventListener('pointerup', onMouseUp)
    }
    c.addEventListener('pointerdown', onMouseDown)
    // return () => {
    //   console.log('remove event')
    //   canvas().removeEventListener('pointerdown', onMouseDown)
    // }
  })

  const onBlank = () => {
    command().blank()
  }

  const onReplay = () => {
    command().replay()
  }

  const onClearHistory = () => {
    command().clearHistory()
  }

  const onUndo = () => {
    command().undo()
  }

  const onRedo = () => {
    command().redo()
  }

  return (
    <main class="main g-full">
      <Title>Scratch</Title>
      <canvas class="main-canvas" ref={setCanvas} />
      <div className="main-btns">
        <button onClick={onBlank}>Blank</button>
        <button onClick={onReplay}>Replay</button>
        <button onClick={onClearHistory}>Clear History</button>
        <button onClick={onUndo}>Undo</button>
        <button onClick={onRedo}>Redo</button>
        <span>History: {historyLength()}</span>
        <span>Undo: {undoLength()}</span>
      </div>
    </main>
  );
}
