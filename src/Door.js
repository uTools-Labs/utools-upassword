import React from 'react'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Reset from './Reset'

export default class Door extends React.Component {
  state = {
    fail: false,
    resetPassword: false
  }

  handleEnter = () => {
    if (this.state.fail) return
    this.props.onVerify(this.passwordInput.value, () => {
      this.setState({ fail: true })
      setTimeout(() => {
        this.setState({ fail: false })
      }, 1000)
    })
  }

  handleInputKeydown = (event) => {
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
    const { fail, resetPassword } = this.state
    if (resetPassword) return <Reset onOut={this.handleResetOut} />
    return (
      <div className={'door-body' + (fail ? ' door-fail' : '')}>
        <div>
          <div className={'door-input' + (fail ? ' door-swing' : '')}>
            <input ref={c => { this.passwordInput = c }} autoFocus onKeyDown={this.handleInputKeydown} type='password' placeholder='开门密码' />
            <div>
              <IconButton onClick={this.handleEnter}>
                <SubdirectoryArrowLeftIcon />
              </IconButton>
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
