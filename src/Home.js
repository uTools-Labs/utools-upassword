import React from 'react'
import './home.less'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import Tree from './Tree'
import AccountArea from './AccountArea'
import Search from './Search'
import SnackbarMessage from './SnackbarMessage'
import ExportDialog from './ExportDialog'

class Home extends React.Component {
  state = {
    selectedGroupId: '',
    sortedGroup: [],
    searchKey: '',
    snackbarMessage: { key: 0, type: 'info', body: '' },
    exportData: null
  }

  handleDetectLive = () => {
    // 窗口无焦点 5 分钟，自动退出
    this.detectLiveTimeout = setTimeout(() => {
      this.detectLiveTimeout = null
      this.props.onOut()
    }, 5 * 60 * 1000)
  }

  handleClearDetectLiveTimeout = () => {
    if (!this.detectLiveTimeout) return
    clearTimeout(this.detectLiveTimeout)
    this.detectLiveTimeout = null
  }

  componentDidMount () {
    const groups = window.utools.db.allDocs('group/')
    const groupDic = {}
    const groupIds = []
    const groupTree = []
    const group2Accounts = {}
    const decryptAccountDic = {}
    if (groups.length > 0) {
      groups.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN', { sensitivity: 'accent' })).forEach(g => { groupDic[g._id] = g })
      groups.forEach(g => {
        if (g.parentId && (g.parentId in groupDic)) {
          if (groupDic[g.parentId].childs) {
            groupDic[g.parentId].childs.push(g)
          } else {
            groupDic[g.parentId].childs = [g]
          }
        } else {
          groupTree.push(g)
        }
        groupIds.push(g._id)
      })
      // 获取解密 KEYIV
      const keyiv = this.props.keyIV
      // 获取所有帐号
      const accounts = window.utools.db.allDocs('account/')
      if (accounts.length > 0) {
        for (const account of accounts) {
          if (account.groupId in group2Accounts) {
            group2Accounts[account.groupId].push(account)
          } else {
            group2Accounts[account.groupId] = [account]
          }
          decryptAccountDic[account._id] = { account }
          if (account.title) {
            try {
              decryptAccountDic[account._id].title = window.services.decryptValue(keyiv, account.title)
            } catch (e) {
              decryptAccountDic[account._id].title = account.title
            }
          }
          if (account.username) {
            try {
              decryptAccountDic[account._id].username = window.services.decryptValue(keyiv, account.username)
            } catch (e) {
              decryptAccountDic[account._id].username = account.username
            }
          }
        }
        for (const groupId in group2Accounts) {
          if (group2Accounts[groupId].length > 1) {
            group2Accounts[groupId] = group2Accounts[groupId].sort((a, b) => a.sort - b.sort)
          }
        }
      }
    }
    this.setState({ groupTree, groupIds, group2Accounts, decryptAccountDic })
    window.addEventListener('blur', this.handleDetectLive)
    window.addEventListener('focus', this.handleClearDetectLiveTimeout)
    window.utools.setSubInput(({ text }) => {
      this.setState({ searchKey: text })
    }, '标题/用户名搜索')
  }

  componentWillUnmount () {
    const { group2Accounts, sortedGroup } = this.state
    if (sortedGroup.length > 0) {
      for (const groupId of sortedGroup) {
        if (groupId in group2Accounts) {
          const length = group2Accounts[groupId].length
          for (let i = 0; i < length; i++) {
            const account = group2Accounts[groupId][i]
            if (account.sort !== i) {
              account.sort = i
              window.utools.db.put(account)
            }
          }
        }
      }
    }
    this.handleClearDetectLiveTimeout()
    window.removeEventListener('blur', this.handleDetectLive)
    window.removeEventListener('focus', this.handleClearDetectLiveTimeout)
  }

  showMessage = (body, type = 'info') => {
    this.setState({ snackbarMessage: { key: Date.now(), body, type } })
  }

  alertDbError = () => {
    this.showMessage('数据写入错误，保存失败', 'error')
  }

  handleGroupUpdate = (node) => {
    const group = { ...node }
    delete group.childs
    const result = window.utools.db.put(group)
    if (result.ok) {
      node._rev = result.rev
    } else {
      this.alertDbError()
    }
  }

  handleGroupCreate = (node, parentNode) => {
    const result = window.utools.db.put({
      _id: 'group/' + Date.now(),
      name: node.name,
      parentId: parentNode ? parentNode._id : ''
    })
    if (result.ok) {
      node._id = result.id
      node._rev = result.rev
    } else {
      this.alertDbError()
    }
  }

  handleGroupDelete = (node) => {
    const result = window.utools.db.remove(node)
    if (result.error) {
      this.alertDbError()
    }
  }

  handleGroupMove = (sourceNode, targeNode) => {
    if (targeNode) {
      sourceNode.parentId = targeNode._id
    } else {
      sourceNode.parentId = ''
    }
    this.handleGroupUpdate(sourceNode)
  }

  handleGroupSelect = (node) => {
    this.setState({ selectedGroupId: node ? node._id : '' })
  }

  handleAccountCreate = () => {
    const { selectedGroupId, group2Accounts, decryptAccountDic } = this.state
    if (!selectedGroupId) return
    const dateNow = Date.now()
    const newAccount = {
      _id: 'account/' + dateNow,
      groupId: selectedGroupId,
      createAt: dateNow
    }
    if (selectedGroupId in group2Accounts) {
      newAccount.sort = group2Accounts[selectedGroupId][group2Accounts[selectedGroupId].length - 1].sort + 1
    } else {
      newAccount.sort = 0
    }
    const result = window.utools.db.put(newAccount)
    if (result.error) {
      return this.alertDbError()
    }
    newAccount._id = result.id
    newAccount._rev = result.rev

    if (selectedGroupId in group2Accounts) {
      group2Accounts[selectedGroupId].push(newAccount)
    } else {
      group2Accounts[selectedGroupId] = [newAccount]
    }
    decryptAccountDic[newAccount._id] = { account: newAccount }
    this.setState({ selectedGroupId })
  }

  handleAccountUpdate = (account) => {
    const result = window.utools.db.put(account)
    if (result.ok) {
      account._rev = result.rev
    } else {
      if (result.error && result.name === 'conflict') { // 修改冲突
        const newdoc = window.utools.db.get(account._id)
        account._rev = newdoc._rev
        const retry = window.utools.db.put(account)
        if (retry.ok) {
          account._rev = result.retry
        } else {
          this.alertDbError()
        }
      } else {
        this.alertDbError()
      }
    }
  }

  handleAccountDelete = (account) => {
    const { group2Accounts, decryptAccountDic } = this.state
    const result = window.utools.db.remove(account)
    if (result.error) {
      return this.alertDbError()
    }
    group2Accounts[account.groupId].splice(group2Accounts[account.groupId].indexOf(account), 1)
    if (group2Accounts[account.groupId].length === 0) {
      delete group2Accounts[account.groupId]
    }
    delete decryptAccountDic[account._id]
    this.setState({ selectedGroupId: account.groupId })
  }

  handleAccountGroupChange = (account, targetGroupId) => {
    const group2Accounts = this.state.group2Accounts
    group2Accounts[account.groupId].splice(group2Accounts[account.groupId].indexOf(account), 1)
    if (group2Accounts[account.groupId].length === 0) {
      delete group2Accounts[account.groupId]
    }
    if (targetGroupId in group2Accounts) {
      account.sort = group2Accounts[targetGroupId][group2Accounts[targetGroupId].length - 1].sort + 1
      group2Accounts[targetGroupId].push(account)
    } else {
      account.sort = 0
      group2Accounts[targetGroupId] = [account]
    }
    account.groupId = targetGroupId
    this.handleAccountUpdate(account)
  }

  findGroupById = (id, childs) => {
    for (const c of childs) {
      if (c._id === id) return c
      if (c.childs) {
        return this.findGroupById(id, c.childs)
      }
    }
    return null
  }

  handleExport = (node) => {
    this.setState({ exportData: { group: node } })
  }

  render () {
    const { searchKey, selectedGroupId, groupIds, groupTree, group2Accounts, sortedGroup, decryptAccountDic, snackbarMessage, exportData } = this.state
    if (!group2Accounts) {
      return (
        <div className='home-loading'>
          <div className='home-loading-spinner'>
            <div className='home-loading-bounce1' />
            <div className='home-loading-bounce2' />
            <div className='home-loading-bounce3' />
          </div>
        </div>
      )
    }
    return (
      <div className='home'>
        {searchKey ? (
          <Search
            keyIV={this.props.keyIV}
            onAccountUpdate={this.handleAccountUpdate}
            groupTree={groupTree}
            group2Accounts={group2Accounts}
            decryptAccountDic={decryptAccountDic}
            searchKey={this.state.searchKey}
          />
        ) : (
          <DndProvider backend={HTML5Backend}>
            <div className='home-body'>
              <div>
                {
                  groupTree && (
                    <Tree
                      onUpdate={this.handleGroupUpdate}
                      onDelete={this.handleGroupDelete}
                      onCreate={this.handleGroupCreate}
                      onExport={this.handleExport}
                      onAppend={this.handleAccountGroupChange}
                      onMove={this.handleGroupMove}
                      onSelect={this.handleGroupSelect}
                      groupIds={groupIds}
                      group2Accounts={group2Accounts}
                      groupTree={groupTree}
                    />)
                }
              </div>
              <div>
                <AccountArea
                  keyIV={this.props.keyIV}
                  decryptAccountDic={decryptAccountDic}
                  data={selectedGroupId ? group2Accounts[selectedGroupId] : null}
                  onCreate={this.handleAccountCreate}
                  onUpdate={this.handleAccountUpdate}
                  onDelete={this.handleAccountDelete}
                  sortedGroup={sortedGroup}
                />
              </div>
            </div>
          </DndProvider>
        )}
        <SnackbarMessage message={snackbarMessage} />
        <ExportDialog data={exportData} showMessage={this.showMessage} group2Accounts={group2Accounts} />
      </div>
    )
  }
}

export default Home
