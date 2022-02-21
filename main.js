const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

// The entry point of any Electron application is its main script.
// This script controls the main process, which runs in a full Node.js environment
// and is responsible for controlling your app's lifecycle, displaying native interfaces,
// performing privileged operations, and managing renderer processes.

// The app module, which controls your application's event lifecycle.
// The BrowserWindow module, which creates and manages application windows.

const createWindow = () =>
{

    // The __dirname string points to the path of the currently executing script (in this case, your project's root folder).
    // The path.join API joins multiple path segments together, creating a combined path string that works across all platforms.

    const win = new BrowserWindow(
    {
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // Open the DevTools.
    //win.webContents.openDevTools();

    win.loadFile('index.html').then(() =>
    {
        console.log("index.html file loaded and this extra bit of code resolves the promise.")
    })

    const contents = win.webContents
}

// Call this createWindow() function to open your window.
// In Electron, browser windows can only be created after the app module's ready event is fired.
// You can wait for this event by using the app.whenReady() API.
// Call createWindow() after whenReady() resolves its Promise.

// Whereas Linux and Windows apps quit when they have no windows open,
// macOS apps generally continue running even without any windows open,
// and activating the app when no windows are available should open a new one.
// To implement this feature, listen for the app module's activate event,
// and call your existing createWindow() method if no browser windows are open.
// Because windows cannot be created before the ready event, you should only listen
// for activate events after your app is initialized.
// Do this by attaching your event listener from within your existing whenReady() callback.

app.whenReady().then(() =>
{
    // Set an IPC listener on the set-title channel with the ipcMain.on API:
    ipcMain.on('set-title', handleSetTitle)

    // ipcRender.invoke message is sent through the dialog:openFile channel from the renderer process.
    // The dialog: prefix on the IPC channel name has no effect on the code.
    // It only serves as a namespace that helps with code readability.
    ipcMain.handle('dialog:openFile', handleFileOpen)

    createWindow()

    app.on('activate', () =>
    {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin') app.quit()
})

// In the main process, we'll be creating a handleFileOpen() function that calls dialog.showOpenDialog
// and returns the value of the file path selected by the user. This function is used as a callback
// whenever an ipcRender.invoke message is sent through the dialog:openFile channel from the renderer process.
async function handleFileOpen()
{
    const { canceled, filePaths } = await dialog.showOpenDialog()
    // The return value is then returned as a Promise to the original invoke call.
    if (canceled)
    {
        return
    }
    else
    {
        return filePaths[0]
    }
}

// handleSetTitle callback has two parameters: an IpcMainEvent structure and a title string.
// Whenever a message comes through the set-title channel, this function will be called.
// To set the title this function will find the BrowserWindow instance attached to the message sender
// and use the win.setTitle API on it.
function handleSetTitle(event, title)
{
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
    console.log("Set title to: " + title)
}
