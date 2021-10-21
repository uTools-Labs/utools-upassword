import React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import zxcvbn from 'zxcvbn'

export default class Reset extends React.Component {
  state = {
    score: 0,
    oldPassword: '',
    oldPasswordVerifyFail: false,
    password: '',
    confirmPassword: '',
    confirmPasswordVerifyFail: false,
    doing: false
  }

  scoreWords = ['密码太简单', '密码太简单', '密码强度一般', '密码强度较高', '密码强度极高']

  handleOldPasswordChange = (e) => {
    const oldPassword = e.target.value
    this.setState({ oldPassword, oldPasswordVerifyFail: false })
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

  handleReset = () => {
    const { score, oldPassword, password, confirmPassword } = this.state
    if (!oldPassword || !password || !confirmPassword || score < 2) return
    if (password !== confirmPassword) return this.setState({ confirmPasswordVerifyFail: true })
    const oldKeyIV = window.services.verifyPassword(oldPassword)
    if (!oldKeyIV) return this.setState({ oldPasswordVerifyFail: true })
    this.setState({ doing: true })
    setTimeout(() => {
      if (!window.services.resetBcryptPass(password)) return
      const newKeyIV = window.services.verifyPassword(password)
      const accounts = window.utools.db.allDocs('account/')
      accounts.forEach(item => {
        ['title', 'username', 'password', 'remark', 'link'].forEach(f => {
          if (!item[f]) return
          try {
            const plainVal = window.services.decryptValue(oldKeyIV, item[f])
            item[f] = window.services.encryptValue(newKeyIV, plainVal)
          } catch (e) {}
        })
      })
      window.utools.db.bulkDocs(accounts)
      this.props.onOut()
    }, 50)
  }

  render () {
    const { doing, oldPassword, oldPasswordVerifyFail, score, password, confirmPassword, confirmPasswordVerifyFail } = this.state
    if (doing) {
      return (
        <div className='reset-doing'>
          <CircularProgress color='secondary' />
          <div className='reset-doing-text'>修改中...</div>
        </div>)
    }
    return (
      <div className='setting-body'>
        <div className='setting-container'>
          <div>
            <TextField
              error={oldPasswordVerifyFail}
              variant='standard'
              autoFocus
              type='password'
              fullWidth
              label='旧的开门密码'
              value={oldPassword}
              onChange={this.handleOldPasswordChange}
              helperText={oldPasswordVerifyFail ? '密码错误' : ''}
            />
          </div>
          <div>
            <TextField
              error={password && score < 2}
              variant='standard'
              type='password'
              fullWidth
              label='新的开门密码'
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
            <div className='reset-btns'>
              <Button onClick={this.props.onOut} size='small' variant='outlined'>取消</Button>
              <Button
                onClick={this.handleReset}
                disabled={!oldPassword || !password || !confirmPassword || score < 2 || confirmPasswordVerifyFail || oldPasswordVerifyFail}
                color='secondary'
                size='large'
                variant='contained'
              >
                修改密码
              </Button>
            </div>
            <div className='setting-remark'>修改开门密码将所有帐号数据解密再重新加密</div>
          </div>
        </div>
      </div>)
  }
}
