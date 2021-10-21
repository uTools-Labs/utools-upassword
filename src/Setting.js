import React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import zxcvbn from 'zxcvbn'

export default class Setting extends React.Component {
  state = {
    score: 0,
    password: '',
    confirmPassword: '',
    confirmPasswordVerifyFail: false
  }

  scoreWords = ['密码太简单', '密码太简单', '密码强度一般', '密码强度较高', '密码强度极高']

  enterAction = (e) => {
    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault()
      this.handleOkClick()
    }
  }

  componentDidMount () {
    window.addEventListener('keydown', this.enterAction, true)
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.enterAction, true)
  }

  handlePasswordChange = (e) => {
    const password = e.target.value
    const score = password ? zxcvbn(password).score : 0
    this.setState({ password, score })
  }

  handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value
    this.setState({ confirmPassword, confirmPasswordVerifyFail: false })
  }

  handleOkClick = () => {
    const { score, password, confirmPassword } = this.state
    if (!password || !confirmPassword || score < 2) return
    if (password !== confirmPassword) return this.setState({ confirmPasswordVerifyFail: true })
    this.props.onSet(password)
  }

  render () {
    const { score, password, confirmPassword, confirmPasswordVerifyFail } = this.state
    return (
      <div className='setting-body'>
        <h2>请先设置开门密码</h2>
        <div className='setting-container'>
          <div>
            <TextField
              error={password && score < 2}
              variant='standard'
              autoFocus
              type='password'
              fullWidth
              label='开门密码'
              value={password}
              onChange={this.handlePasswordChange}
              helperText={password ? this.scoreWords[score] : ''}
            />
          </div>
          <div>
            <TextField
              error={confirmPasswordVerifyFail}
              variant='standard'
              type='password'
              fullWidth
              label='确认开门密码'
              value={confirmPassword}
              onChange={this.handleConfirmPasswordChange}
              helperText={confirmPasswordVerifyFail ? '密码不一致' : ''}
            />
          </div>
          <div>
            <Button onClick={this.handleOkClick} disabled={!password || !confirmPassword || score < 2 || confirmPasswordVerifyFail} fullWidth color='primary' size='large' variant='contained'>确认</Button>
            <div className='setting-remark'>开门密码用于验证进入及加密数据，忘记开门密码无法找回</div>
          </div>
        </div>
      </div>)
  }
}
