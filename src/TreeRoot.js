
import React from 'react'
import { DropTarget } from 'react-dnd'

const nodeTarget = {
  canDrop (props, monitor) {
    const source = monitor.getItem()
    if (source.id.indexOf('-') === -1) return false
    return true
  },
  drop (props, monitor, component) {
    if (!component.props.isOverCurrent) return
    if (monitor.didDrop()) {
      return
    }
    props.move(monitor.getItem().id, '')
  }
}

@DropTarget('treenode', nodeTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop()
}))
class TreeRoot extends React.Component {
  render () {
    const { isOverCurrent, canDrop, connectDropTarget, children, onClick } = this.props
    return connectDropTarget(
      <div onClick={onClick} className='tree-root' style={(isOverCurrent && canDrop) ? { opacity: 0.5 } : null}>
        <div className='tree-root-child'>{children}</div>
      </div>
    )
  }
}

export default TreeRoot
