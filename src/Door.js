import React from 'react'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import InputBase from '@mui/material/InputBase'
import Reset from './Reset'

export default class Door extends React.Component {
  state = {
    fail: false,
    passwordValue: '',
    resetPassword: false,
    isCapsLock: false,
    isComposition: false
  }

  handleEnter = () => {
    if (this.state.fail) return
    this.props.onVerify(this.state.passwordValue, () => {
      this.setState({ fail: true })
      setTimeout(() => {
        this.setState({ fail: false })
      }, 1000)
    })
  }

  handleInputChange = (event) => {
    if (this.state.isComposition) return
    this.setState({ passwordValue: event.target.value })
  }

  handleInputKeydown = (event) => {
    if (event.getModifierState('CapsLock')) {
      if (!this.state.isCapsLock) this.setState({ isCapsLock: true })
    } else {
      if (this.state.isCapsLock) this.setState({ isCapsLock: false })
    }
    if (event.keyCode === 229) {
      if (!this.state.isComposition) this.setState({ isComposition: true })
      event.target.blur()
      setTimeout(() => { event.target.focus() }, 300)
      return
    }
    if (this.state.isComposition) this.setState({ isComposition: false })
    if (event.keyCode !== 13) return
    event.preventDefault()
    this.handleEnter()
  }

  handleResetClick = () => {
    this.setState({ resetPassword: true })
  }

  handleResetOut = () => {
    this.setState({ resetPassword: false })
  }

  render () {
    const { fail, resetPassword, passwordValue, isCapsLock, isComposition } = this.state
    if (resetPassword) return <Reset onOut={this.handleResetOut} />
    return (
      <div className={'door-body' + (fail ? ' door-fail' : '')}>
        <div>
          <div className={'door-input' + (fail ? ' door-swing' : '')}>
            <InputBase
              autoFocus
              fullWidth
              type='password'
              placeholder='开门密码'
              value={passwordValue}
              onKeyDown={this.handleInputKeydown}
              onChange={this.handleInputChange}
            />
            <div className='door-input-enter'>
              <IconButton onClick={this.handleEnter}>
                <SubdirectoryArrowLeftIcon />
              </IconButton>
            </div>
            <div className='door-tooltip'>
              {isCapsLock && <div>键盘大写锁定已打开</div>}
              {isComposition && <div>请切换到英文输入法</div>}
            </div>
          </div>
        </div>
        <div>
          <Button onClick={this.handleResetClick}>修改开门密码</Button>
        </div>
      </div>
    )
  }
}
