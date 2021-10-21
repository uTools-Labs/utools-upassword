import React from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export default class SnackbarMessage extends React.Component {
  state = {
    open: false
  }

  componentDidUpdate (prevProps) {
    if (prevProps.message !== this.props.message) {
      this.setState({ open: true })
    }
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') return
    this.setState({ open: false })
  }

  render () {
    const { open } = this.state
    const { key, type, body } = this.props.message
    return (
      <Snackbar
        key={key}
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={this.handleClose}
      >
        <Alert onClose={this.handleClose} variant='filled' severity={type}>{body}</Alert>
      </Snackbar>
    )
  }
}
