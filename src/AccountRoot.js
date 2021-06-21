
import React from 'react'
import { DropTarget } from 'react-dnd'

const boxTarget = {
  canDrop (props, monitor) {
    const source = monitor.getItem()
    if (source.index === props.index - 1) return false
    return true
  },
  drop (props, monitor, component) {
    if (!component.props.isOverCurrent) return
    if (monitor.didDrop()) {
      return
    }
    const source = monitor.getItem()
    props.onMove(source.index, props.index - 1)
  }
}

@DropTarget('account', boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop()
}))
class AccountRoot extends React.Component {
  render () {
    const { isOverCurrent, canDrop, connectDropTarget, children } = this.props
    return connectDropTarget(
      <div className='account-root'>
        <div>{children}</div>
        {(isOverCurrent && canDrop) && <div className='account-root-sort' />}
      </div>)
  }
}

export default AccountRoot
