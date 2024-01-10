import { app, shell, BrowserWindow, globalShortcut, clipboard } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { Key, keyboard } from '@nut-tree/nut-js'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const WAIT_THRESHOLD = 200

type OllamaResponse = {
  model: string
  created_at: string
  response: string
  done: true
  total_duration: number
  load_duration: number
  prompt_eval_count: number
  prompt_eval_duration: number
  eval_count: number
  eval_duration: number
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.

// /**
//  * Parse Ollama Host URL from preferences.
//  * @returns {string} Parsed Ollama Host route
//  */
// function parseOllamaHostUrl(): string {
//   let url: string;
//   url = (preferences.ollamaHost as string).replace("localhost", "127.0.0.1");
//   if (url[url.length - 1] !== "/") url += "/";
//   return url;
// }

async function getFixedText(selectedText: string) {
  try {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        model: 'mistral',
        stream: true,
        format: 'json',
        prompt: `[INST] Fix grammar and spelling mistakes in this text. Return fixed text only. [\\INST]${selectedText}`
      })
    })


    try {
      const data = (await response.json()) as OllamaResponse
      return data
    } catch (parsingError) {
      console.error('getFixedText() error parsing', parsingError)
      throw parsingError
    }
  } catch (error) {
    console.error('getFixedText() error', error)
    throw error
  }
}

function wait(timeInMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  globalShortcut.register('Option+S', async () => {
    const currentClipboardContent = clipboard.readText() // preserve clipboard content
    clipboard.clear()
    /**
     * To select an entire line, between line breaks (aka a paragraph):
     * @see https://apple.stackexchange.com/questions/285113/is-there-a-mac-keyboard-shortcut-to-select-current-line
     */
    // await keyboard.type(Key.LeftShift, Key.LeftAlt, Key.Up)
    // await keyboard.pressKey(Key.LeftShift, Key.LeftAlt, Key.Up)
    await keyboard.pressKey(Key.LeftShift, Key.Home,)
    await keyboard.releaseKey(Key.LeftShift, Key.Home,)

    await keyboard.pressKey(Key.LeftCmd, Key.C)
    await keyboard.releaseKey(Key.LeftCmd, Key.C)

    console.log('await keyboard.type(Key.LeftCmd, Key.C)') // Copy the selected text

    const selectedText = clipboard.readText()

    const data = await getFixedText(selectedText)

    console.log({ data })

    clipboard.writeText(data.response)
    await keyboard.pressKey(Key.LeftCmd, Key.V)
    await keyboard.releaseKey(Key.LeftCmd, Key.V)

    clipboard.writeText(currentClipboardContent)
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
