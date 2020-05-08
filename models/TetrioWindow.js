const path                      = require('path')
const { EventEmitter }          = require('events')
const { BrowserWindow, shell }  = require('electron')
const { fetchTetrioState }      = require('../utils/tetrio-state')

class TetrioWindow extends EventEmitter {

    constructor() {
        super()
        this._window = new BrowserWindow({
            title: 'TETR.IO',
            show: false,
            width: 1280,
            height: 720,
            icon: path.join(__dirname, '..', 'build', 'icon.ico'),
            webPreferences: { enableRemoteModule: false }
        })

        this._initialize()
    }

    async _initialize() {
        this._window.on('ready-to-show', () => {
            this._window.show()
            this.emit('tetrio-started')
        })

        this._window.on('closed', () => {
            this._window = undefined
            this.emit('tetrio-closed')
        })

        this._window.webContents.on('new-window', (e, url) => {
            e.preventDefault()
            shell.openExternal(url)
        })
        this._window.webContents.on('will-navigate', (e, url) => {
            if (url != this._window.webContents.getURL()) {
                e.preventDefault()
                shell.openExternal(url)
            }
        })

        this._window.setMenuBarVisibility(false)
        await this._window.loadURL('https://tetr.io/')
    }

    fetchGameState() {
        if (!this._window) return
        return fetchTetrioState(this._window)
    }

    get isActive() { return !!this._window }

}

module.exports = TetrioWindow