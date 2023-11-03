import classNames from 'classnames'
import './index.css'

export default function Toolbar({ painter, historyLength, undoLength }) {
  const onUndo = () => {
    painter().undo()
  }

  const onRedo = () => {
    painter().redo()
  }

  const onBlank = () => {
    painter().blank()
  }

  return (
    <div className="c-toolbar">
      <i class={classNames('mdi mdi-undo', { disabled: !historyLength() })} title="Undo" onClick={onUndo} />
      <i class={classNames('mdi mdi-redo', { disabled: !undoLength() })} title="Redo" onClick={onRedo} />
      <i class="mdi mdi-cancel" title="Blank" onClick={onBlank} />
    </div>
  )
}
