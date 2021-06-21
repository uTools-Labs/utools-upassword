import React from 'react'
import { DropTarget, DragSource } from 'react-dnd'

const nodeSource = {
  canDrag (props) {
    return !props.isInput
  },
  beginDrag (props, monitor, component) {
    return { id: props.id }
  }
}

const nodeTarget = {
  canDrop (props, monitor) {
    const source = monitor.getItem()
    if (source.account) {
      if (source.account.groupId === props.groupId) return false
      return true
    }
    if (props.id.indexOf(source.id) === 0) return false
    if (source.id.substr(0, source.id.lastIndexOf('-')) === props.id) return false
    if (props.deep > 6) return false
    return true
  },
  drop (props, monitor, component) {
    if (!component.props.isOverCurrent) return
    if (monitor.didDrop()) return
    const targetKey = props.id
    const source = monitor.getItem()
    if (source.account) {
      props.append(source.account, targetKey)
      return
    }
    const sourceKey = source.id
    props.move(sourceKey, targetKey)
  }
}

@DropTarget(['treenode', 'account'], nodeTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  // isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType()
}))
@DragSource('treenode', nodeSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview()
  // isDragging: monitor.isDragging()
}))
class TreeNode extends React.Component {
  render () {
    const { isOverCurrent, canDrop, connectDragPreview, connectDragSource, connectDropTarget, deep, onClick, isParent, children, isSelected, isInput, title, badge, onBlur, onExpand } = this.props
    const left = deep * 16 + (isParent ? 0 : 15) + 8
    return connectDragSource(connectDropTarget(
      <div style={(isOverCurrent && canDrop) ? { opacity: 0.3 } : null}>
        <div onClick={onClick} className='tree-node'>
          <div style={{ paddingLeft: left }} className={'tree-node-body' + (isSelected ? ' tree-node-selected' : '')}>
            {isParent && <div onClick={onExpand} className={children ? 'tree-node-icon-arrow-down' : 'tree-node-icon-arrow-right'} />}
            {isInput ? (
              <div onClick={(e) => e.stopPropagation()} className='tree-node-edit-box'>
                <input
                  type='text'
                  autoFocus
                  onKeyDown={(e) => { if (e.keyCode === 13) { e.stopPropagation(); e.preventDefault(); onBlur(e) } }}
                  onFocus={(e) => e.target.select()}
                  onBlur={onBlur}
                  defaultValue={title}
                />
              </div>
            ) : (
              <div className='tree-node-title'>{title}</div>
            )}
            {(!isInput && badge > 0) && <div className='tree-node-badge'><span>{badge}</span></div>}
          </div>
          {connectDragPreview(<div style={{ left }} className='tree-node-preview'>{title}</div>)}
        </div>
        {children}
      </div>))
  }
}

export default TreeNode
