import React from 'react'
import Door from './Door'
import Setting from './Setting'
import Home from './Home'

export default class Passwords extends React.Component {
  state = {
    hadKey: Boolean(window.utools.db.get('bcryptpass')),
    keyIV: ''
  }

  handleVerify = (passText, errorCallback) => {
    const keyIV = window.services.verifyPassword(passText)
    if (keyIV) {
      return this.setState({ keyIV })
    }
    errorCallback()
  }

  handleOut = () => {
    if (this.state.keyIV) {
      this.setState({ keyIV: '' })
      window.utools.removeSubInput()
    }
  }

  handleSetBcryptPass = (passText) => {
    const isOk = window.services.setBcryptPass(passText)
    if (!isOk) return
    // 插入基本数据
    const newGroup = window.utools.db.put({ _id: 'group/' + Date.now(), name: '默认分组', parentId: '' })
    if (newGroup.ok) {
      const keyiv = window.services.verifyPassword(passText)
      const newAccount = {
        _id: 'account/' + Date.now(),
        title: window.services.encryptValue(keyiv, '默认标题'),
        username: window.services.encryptValue(keyiv, '默认用户名'),
        groupId: newGroup.id,
        createAt: Date.now(),
        sort: 0
      }
      window.utools.db.put(newAccount)
    }
    this.setState({ hadKey: true, keyIV: '' })
  }

  render () {
    const { hadKey, keyIV } = this.state
    if (!hadKey) return <Setting onSet={this.handleSetBcryptPass} />
    if (!keyIV) return <Door onVerify={this.handleVerify} />
    return <Home keyIV={keyIV} onOut={this.handleOut} />
  }
}
