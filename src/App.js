import React from 'react'
import Passwords from './Passwords'
import Random from './Random'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'

const themeDic = {
  light: createMuiTheme({
    palette: {
      type: 'light'
    },
    props: {
      MuiButtonBase: {
        disableRipple: true
      }
    }
  }),
  dark: createMuiTheme({
    palette: {
      type: 'dark',
      primary: {
        main: '#90caf9'
      },
      secondary: {
        main: '#f48fb1'
      }
    },
    props: {
      MuiButtonBase: {
        disableRipple: true
      }
    }
  })
}

export default class App extends React.Component {
  state = {
    code: '',
    theme: 'light'
  }

  componentDidMount () {
    // 主题切换
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.setState({ theme: e.matches ? 'dark' : 'light' })
    })
    // 插件初始化
    window.utools.onPluginReady(() => {
      const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      if (this.state.theme !== theme) {
        this.setState({ theme })
      }
    })
    // 进入插件
    window.utools.onPluginEnter(({ code, type, payload }) => {
      this.setState({ code })
    })
    // 退出插件
    window.utools.onPluginOut(() => {
      this.setState({ code: '' })
    })
  }

  render () {
    const { code, theme } = this.state
    if (code === 'passwords') return <ThemeProvider theme={themeDic[theme]}><Passwords /></ThemeProvider>
    if (code === 'random') return <ThemeProvider theme={themeDic[theme]}><Random /></ThemeProvider>
    return false
  }
}
