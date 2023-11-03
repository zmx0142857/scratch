import clsx from 'clsx'
import { historyLength, undoLength } from '~/store'
import './index.css'

export default function Toolbar({ painter }) {
  return (
    <div className="c-toolbar g-center">
      <i class={clsx('mdi mdi-undo', { disabled: !historyLength() })} title="Undo" onClick={() => painter().undo()} />
      <i class={clsx('mdi mdi-redo', { disabled: !undoLength() })} title="Redo" onClick={() => painter().redo()} />
      <i class="mdi mdi-cancel" title="Clear" onClick={() => painter().clear()} />
    </div>
  )
}
