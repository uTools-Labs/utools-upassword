import React from 'react'
import RandomPassword from './RandomPassword'
import Button from '@mui/material/Button'
import SendIcon from '@mui/icons-material/Send'

export default class Random extends React.Component {
  handleCopy = () => {
    const passwordValue = this.randomPasswordRef.getPasswordValue()
    window.utools.copyText(passwordValue)
    window.utools.hideMainWindow()
  }

  componentDidMount () {
    this.randomPasswordRef.generateRandom()
    window.addEventListener('copy', this.handleCopy)
  }

  componentWillUnmount () {
    window.removeEventListener('copy', this.handleCopy)
  }

  render () {
    return (
      <div className='random-body'>
        <RandomPassword from='random' ref={c => { this.randomPasswordRef = c }} />
        <div>
          <Button onClick={this.handleCopy} variant='contained' color='primary' endIcon={<SendIcon />}>复制密码 ({window.utools.isMacOs() ? '⌘' : 'Ctrl'}+C)</Button>
        </div>
      </div>)
  }
}
