import React from 'react'
import Passwords from './Passwords'
import Random from './Random'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const themeDic = {
  light: createTheme({
    typography: {
      fontFamily: 'system-ui'
    },
    palette: {
      mode: 'light'
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableFocusRipple: true
        }
      }
    }
  }),
  dark: createTheme({
    typography: {
      fontFamily: 'system-ui'
    },
    palette: {
      mode: 'dark'
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableFocusRipple: true
        }
      }
    }
  })
}

export default class App extends React.Component {
  state = {
    code: '',
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  componentDidMount () {
    // 进入插件
    window.utools.onPluginEnter(({ code, type, payload }) => {
      this.setState({ code })
    })
    // 退出插件
    window.utools.onPluginOut(() => {
      this.setState({ code: '' })
    })
    // 主题切换事件
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.setState({ theme: e.matches ? 'dark' : 'light' })
    })
  }

  render () {
    const { code, theme } = this.state
    if (code === 'passwords') return <ThemeProvider theme={themeDic[theme]}><Passwords /></ThemeProvider>
    if (code === 'random') return <ThemeProvider theme={themeDic[theme]}><Random /></ThemeProvider>
    return false
  }
}
