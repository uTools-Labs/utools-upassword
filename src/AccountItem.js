import React from 'react'
import { DragSource, DropTarget } from 'react-dnd'

const boxSource = {
  beginDrag (props, monitor, component) {
    return { account: props.data.account, index: props.index }
  }
}

const boxTarget = {
  canDrop (props, monitor) {
    const source = monitor.getItem()
    if (props.index - source.index === 1 || props.index === source.index) return false
    return true
  },
  drop (props, monitor, component) {
    if (monitor.didDrop()) {
      return
    }
    const source = monitor.getItem()
    if (source.index < props.index) {
      props.onMove(source.index, props.index - 1)
    } else {
      props.onMove(source.index, props.index)
    }
  }
}

@DropTarget('account', boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop(),
  isOver: monitor.isOver()
}))
@DragSource('account', boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class AccountItem extends React.Component {
  render () {
    const { isDragging, isOver, canDrop, connectDropTarget, connectDragSource, data, isSelected } = this.props
    return connectDropTarget(connectDragSource(
      <div style={{ opacity: isDragging ? 0 : 1 }} className='account-item'>
        {(isOver && canDrop) && <div className='account-item-sort' />}
        <div className={'account-item-body' + (isSelected ? ' account-item-selected' : '')}>
          <div id={data.account._id + '_title'}>{data.title}</div>
          <div className='account-item-username' id={data.account._id + '_username'}>{data.username}</div>
        </div>
      </div>))
  }
}

export default AccountItem
