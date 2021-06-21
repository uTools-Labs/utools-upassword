import React from 'react'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import Popover from '@material-ui/core/Popover'
import TitleIcon from '@material-ui/icons/Title'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import LinkIcon from '@material-ui/icons/Link'
import VisibilityIcon from '@material-ui/icons/Visibility'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'
import CopyrightIcon from '@material-ui/icons/Copyright'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import AutorenewIcon from '@material-ui/icons/Autorenew'
import LockIcon from '@material-ui/icons/Lock'
import SendIcon from '@material-ui/icons/Send'
import RandomPassword from './RandomPassword'

export default class AccountForm extends React.Component {
  isMacOs = window.utools.isMacOs()

  state = {
    titleValue: '',
    usernameValue: '',
    passwordValue: '',
    remarkValue: '',
    linkValue: '',
    passwordEye: false,
    randomPasswordEl: null
  }

  keydownAction = (e) => {
    if ((e.code === 'KeyU' || e.code === 'KeyP') && (this.isMacOs ? e.metaKey : e.ctrlKey)) {
      e.preventDefault()
      e.stopPropagation()
      window.utools.hideMainWindow()
      this.handleCopy(e.code === 'KeyU' ? 'usernameValue' : 'passwordValue')()
    }
    if ((e.code === 'ArrowUp' || e.code === 'ArrowDown') && e.keyCode === 229) {
      e.stopPropagation()
    }
  }

  componentDidMount () {
    const stateValue = {}
    const data = this.props.data
    ;['title', 'username', 'password', 'remark', 'link'].forEach(f => {
      if (data[f]) {
        try {
          stateValue[f + 'Value'] = window.services.decryptValue(this.props.keyIV, data[f])
        } catch (e) {
          stateValue[f + 'Value'] = data[f]
        }
      }
    })
    this.setState(stateValue)
    window.addEventListener('keydown', this.keydownAction, true)
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.keydownAction, true)
  }

  UNSAFE_componentWillReceiveProps (nextProps) { // eslint-disable-line
    const stateValue = {};
    ['title', 'username', 'password', 'remark', 'link'].forEach(f => {
      if (nextProps.data[f]) {
        try {
          stateValue[f + 'Value'] = window.services.decryptValue(nextProps.keyIV, nextProps.data[f])
        } catch (e) {
          stateValue[f + 'Value'] = nextProps.data[f]
        }
      } else {
        stateValue[f + 'Value'] = ''
      }
    })
    this.setState(stateValue)
  }

  handleInputChang = field => e => {
    const value = e.target.value
    if (field === 'title' || field === 'username') {
      this.props.decryptAccountDic[this.props.data._id][field] = value
      document.getElementById(this.props.data._id + '_' + field).innerText = value
    }
    const stateValue = {}
    stateValue[field + 'Value'] = value
    this.setState(stateValue)
    if (this.inputDelayTimer) {
      clearTimeout(this.inputDelayTimer)
    }
    const doc = this.props.data
    this.inputDelayTimer = setTimeout(() => {
      this.inputDelayTimer = null
      if (value) {
        doc[field] = window.services.encryptValue(this.props.keyIV, value)
      } else {
        delete doc[field]
      }
      this.props.onUpdate(doc)
    }, 300)
  }

  handleCopy = (target) => () => {
    const targetValue = this.state[target]
    window.utools.copyText(targetValue)
  }

  handlePasswordVisible = () => {
    if (this.state.passwordEye) {
      this.setState({ passwordEye: false })
    } else {
      this.setState({ passwordEye: true })
    }
  }

  handleShowRandomPassword = (e) => {
    this.setState({ randomPasswordEl: e.currentTarget })
    setTimeout(() => {
      this.randomPasswordRef.generateRandom()
    })
  }

  handleCloseRandomPassword = () => {
    this.setState({ randomPasswordEl: null })
  }

  handleOpenLink = () => {
    if (!this.state.linkValue) return
    window.utools.hideMainWindow(false)
    window.utools.shellOpenExternal(this.state.linkValue)
  }

  handleOkRandomPassword = () => {
    const newPasswordValue = this.randomPasswordRef.getPasswordValue()
    this.handleInputChang('password')({ target: { value: newPasswordValue } })
    this.setState({ randomPasswordEl: null })
  }

  render () {
    const { titleValue, usernameValue, passwordValue, linkValue, remarkValue, passwordEye, randomPasswordEl } = this.state
    return (
      <div className='account-form'>
        <div>
          <TextField
            fullWidth
            label='标题'
            id='accountFormTitle'
            onChange={this.handleInputChang('title')}
            value={titleValue}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <TitleIcon style={{ color: '#ababab' }} />
                </InputAdornment>
              )
            }}
          />
        </div>
        <div>
          <TextField
            fullWidth
            label='用户名'
            onChange={this.handleInputChang('username')}
            value={usernameValue}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <AccountBoxIcon style={{ color: '#ababab' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title={'复制帐号 ' + (this.isMacOs ? '⌘' : 'Ctrl') + '+U'} placement='top'>
                    <IconButton tabIndex='-1' onClick={this.handleCopy('usernameValue')} size='small'>
                      <CopyrightIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </div>
        <div>
          <TextField
            type={passwordEye ? 'text' : 'password'}
            fullWidth
            label='密码'
            onChange={this.handleInputChang('password')}
            value={passwordValue}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <LockIcon style={{ color: '#ababab' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title={passwordEye ? '关闭明文' : '明文显示'} placement='top'>
                    <IconButton tabIndex='-1' onClick={this.handlePasswordVisible} size='small'>
                      {passwordEye ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Tooltip>
                  <span className='account-form-icon-divider' />
                  <Tooltip title='使用随机密码' placement='top'>
                    <IconButton tabIndex='-1' onClick={this.handleShowRandomPassword} size='small'>
                      <AutorenewIcon />
                    </IconButton>
                  </Tooltip>
                  <span className='account-form-icon-divider' />
                  <Tooltip title={'复制密码 ' + (this.isMacOs ? '⌘' : 'Ctrl') + '+P'} placement='top'>
                    <IconButton tabIndex='-1' onClick={this.handleCopy('passwordValue')} size='small'>
                      <CopyrightIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
          <Popover
            open={Boolean(randomPasswordEl)}
            anchorEl={randomPasswordEl}
            onClose={this.handleCloseRandomPassword}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <div className='random-password-popover'>
              <RandomPassword from='accountform' ref={c => { this.randomPasswordRef = c }} />
              <div className='random-password-popover-footer'>
                <Button onClick={this.handleOkRandomPassword} variant='contained' color='primary' endIcon={<SendIcon />}>使用该密码</Button>
              </div>
            </div>
          </Popover>
        </div>
        <div>
          <TextField
            fullWidth
            label='链接'
            onChange={this.handleInputChang('link')}
            value={linkValue}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <LinkIcon style={{ color: '#ababab' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <Tooltip title='浏览器中打开' placement='top'>
                    <IconButton tabIndex='-1' onClick={this.handleOpenLink} size='small'>
                      <OpenInBrowserIcon />
                    </IconButton>
                  </Tooltip>
                  <span className='account-form-icon-divider' />
                  <Tooltip title='复制链接' placement='top'>
                    <IconButton tabIndex='-1' onClick={this.handleCopy('linkValue')} size='small'>
                      <CopyrightIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        </div>
        <div>
          <TextField
            fullWidth
            label='说明'
            multiline
            rows={11}
            value={remarkValue}
            onChange={this.handleInputChang('remark')}
            InputLabelProps={{ shrink: true }}
            variant='outlined'
          />
        </div>
      </div>
    )
  }
}
