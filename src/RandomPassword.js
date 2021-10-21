import React from 'react'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Tooltip from '@mui/material/Tooltip'
import InputAdornment from '@mui/material/InputAdornment'
import TextFormatIcon from '@mui/icons-material/TextFormat'
import GolfCourseIcon from '@mui/icons-material/GolfCourse'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import ReplayIcon from '@mui/icons-material/Replay'

export default class RandomPassword extends React.Component {
  defaultSpecialCharacters = '!@#$%^&*()_+-=,.<>?/\\|[]{}:;"\'`~'

  constructor (props) {
    super(props)
    const specialCharacters = window.localStorage.getItem('specialCharacters@' + this.props.from) || this.defaultSpecialCharacters
    let charTypes = window.localStorage.getItem('charTypes@' + this.props.from)
    if (charTypes) {
      try {
        charTypes = JSON.parse(charTypes)
      } catch (e) {
        charTypes = ['0-9', 'a-z', 'A-Z', '*']
      }
    } else {
      charTypes = ['0-9', 'a-z', 'A-Z', '*']
    }
    const lengthValue = parseInt(window.localStorage.getItem('lengthValue@' + this.props.from) || 12, 10) || 12
    this.state = {
      specialCharacters,
      charTypes,
      lengthValue,
      passwordValue: ''
    }
  }

  handleKeyDownSpecialCharacters = (e) => {
    if ([8, 37, 39, 46].includes(e.keyCode)) return // 删除 左右方向键 向后删除不处理
    if (!this.defaultSpecialCharacters.includes(e.key) || this.state.specialCharacters.includes(e.key)) {
      e.preventDefault()
    }
  }

  handleChangeSpecialCharacters = (e) => {
    const value = e.target.value
    for (let i = 0; i < value.length; i++) {
      if (value.charCodeAt(i) > 128) return
    }
    this.setState({ specialCharacters: value })
    window.localStorage.setItem('specialCharacters@' + this.props.from, value)
    setTimeout(() => { this.generateRandom() }, 50)
  }

  handleCharChange = (e) => {
    const key = e.target.value
    if (e.target.checked) {
      if (this.state.charTypes.includes(key)) return
      this.state.charTypes.push(key)
    } else {
      if (this.state.charTypes.length === 1) return
      const index = this.state.charTypes.indexOf(key)
      if (index === -1) return
      this.state.charTypes.splice(index, 1)
    }
    this.setState({ charTypes: this.state.charTypes })
    window.localStorage.setItem('charTypes@' + this.props.from, JSON.stringify(this.state.charTypes))
    setTimeout(() => { this.generateRandom() }, 50)
  }

  handleLengthChange = (event, value) => {
    value = value || parseInt(event.target.value)
    if (value > 256) value = 256
    if (value < 1) value = 1
    this.setState({ lengthValue: value })
    window.localStorage.setItem('lengthValue@' + this.props.from, value)
    if (this.lengthChangeTimeout) {
      clearTimeout(this.lengthChangeTimeout)
    }
    this.lengthChangeTimeout = setTimeout(() => {
      this.lengthChangeTimeout = null
      this.generateRandom()
    }, 50)
  }

  generateRandom = () => {
    const charTypes = this.state.charTypes
    let sourceStr = ''
    sourceStr += charTypes.includes('A-Z') ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''
    sourceStr += charTypes.includes('a-z') ? 'abcdefghijklmnopqrstuvwxyz' : ''
    sourceStr += charTypes.includes('0-9') ? '0123456789' : ''
    sourceStr += charTypes.includes('*') ? this.state.specialCharacters : ''
    let passwordValue = ''
    for (var i = 0; i < this.state.lengthValue; i++) {
      passwordValue += sourceStr.charAt(Math.floor(Math.random() * sourceStr.length))
    }
    this.setState({ passwordValue })
  }

  handleReplay = () => {
    this.generateRandom()
  }

  handlePasswordChange = (e) => {
    const value = e.target.value
    if (!value) {
      return this.generateRandom()
    }
    this.setState({ passwordValue: value, lengthValue: value.length })
  }

  getPasswordValue = () => {
    return this.state.passwordValue
  }

  render () {
    const { specialCharacters, charTypes, lengthValue, passwordValue } = this.state
    return (
      <div className='random-password'>
        <div>
          <div className='random-password-label'><TextFormatIcon /><span>包含字符</span></div>
          <div>
            <FormGroup row>
              <FormControlLabel
                control={<Checkbox checked={charTypes.includes('0-9')} onChange={this.handleCharChange} value='0-9' color='primary' />}
                label='0-9'
              />
              <FormControlLabel
                control={<Checkbox checked={charTypes.includes('a-z')} onChange={this.handleCharChange} value='a-z' color='primary' />}
                label='a-z'
              />
              <FormControlLabel
                control={<Checkbox checked={charTypes.includes('A-Z')} onChange={this.handleCharChange} value='A-Z' color='primary' />}
                label='A-Z'
              />
              <FormControlLabel
                control={<Checkbox checked={charTypes.includes('*')} onChange={this.handleCharChange} value='*' color='primary' />}
                label={<TextField variant='standard' style={{ width: 240 }} disabled={!charTypes.includes('*')} value={specialCharacters} onKeyDown={this.handleKeyDownSpecialCharacters} onChange={this.handleChangeSpecialCharacters} />}
              />
            </FormGroup>
          </div>
        </div>
        <div>
          <div className='random-password-label'><GolfCourseIcon /><span>密码长度</span></div>
          <div className='random-password-length-box'>
            <div>
              <Slider min={1} max={256} valueLabelDisplay='auto' value={lengthValue} onChange={this.handleLengthChange} />
            </div>
            <div>
              <TextField variant='outlined' hiddenLabel type='number' size='small' value={lengthValue} onChange={this.handleLengthChange} InputLabelProps={{ shrink: true }} fullWidth />
            </div>
          </div>
        </div>
        <div>
          <div className='random-password-label'><VpnKeyIcon /><span>生成的随机密码</span></div>
          <div>
            <TextField
              fullWidth
              hiddenLabel
              onChange={this.handlePasswordChange}
              value={passwordValue}
              variant='outlined'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Tooltip title='重新生成' placement='top'>
                      <IconButton onClick={this.handleReplay} color='primary'>
                        <ReplayIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </div>
        </div>
      </div>)
  }
}
