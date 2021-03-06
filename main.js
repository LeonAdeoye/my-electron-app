const { app, BrowserWindow, ipcMain, dialog, Menu, globalShortcut, Notification } = require('electron')
const path = require('path')

// The entry point of any Electron application is its main script.
// This script controls the main process, which runs in a full Node.js environment
// and is responsible for controlling your app's lifecycle, displaying native interfaces,
// performing privileged operations, and managing renderer processes.

// The app module, which controls your application's event lifecycle.
// The BrowserWindow module, which creates and manages application windows.

const NOTIFICATION_TITLE = 'Basic Notification'
const NOTIFICATION_BODY = 'Notification from the Main process'

let progressInterval

function showNotification ()
{
    new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}

const createWindow = () =>
{

    // The __dirname string points to the path of the currently executing script (in this case, your project's root folder).
    // The path.join API joins multiple path segments together, creating a combined path string that works across all platforms.

    const win = new BrowserWindow(
    {
        width: 800,
        height: 600,
        minWidth: 450,
        minHeight: 500,
        titleBarStyle: 'hidden',
        title: "Hello", // redundant
        transparent: false,
        backgroundColor: '#9e7b8c', // Can also set in style sheet. Style sheet setting is commented out coz is has more importance.

        titleBarOverlay:
        {
            color: '#2f3241',
            symbolColor: '#74b1be'
        },
        frame: true, // Defaults to true but false removes the frame (with the top-level menu)
        webPreferences:
        {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const child = new BrowserWindow({
        parent: win,
        width: 300,
        height: 200,
        minWidth: 250,
        minHeight: 100,
        opacity: 0.95,
        title: "This is a modal dialog",
        modal:true,
        backgroundColor: '#7e7474' // Can also set in style sheet. Style sheet seeting is commented out coz is has more importance.
    })
    child.show()

    // Open the DevTools.
    //win.webContents.openDevTools();

    // When sending a message from the main process to a renderer process, you need to specify which renderer is receiving the message.
    // Messages need to be sent to a renderer process via its WebContents instance.
    // This WebContents instance contains a send method that can be used in the same way as ipcRenderer.send.
    // First build a custom menu in the main process using Electron's Menu module that uses the webContents.send API
    // to send an IPC message from the main process to the target renderer.
    const menu = Menu.buildFromTemplate([
        {
            // The click handler sends a message (either 1 or -1) to the renderer process through the 'update-counter' channel.
            label: "Counter menu - click to use",
            submenu: [
                {
                    click: () => win.webContents.send('update-counter', 1),
                    // Local keyboard shortcuts are triggered only when the application is focused.
                    // To configure a local keyboard shortcut, you need to specify an accelerator property when creating a MenuItem within the Menu module.
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
                    label: 'Click to increment',
                },
                {
                    click: () => win.webContents.send('update-counter', -1),
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+D' : 'Alt+Shift+D',
                    label: 'Click to decrement',
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    const contents = win.webContents
    // The Web Bluetooth API can be used to communicate with bluetooth devices.
    // In order to use this API in Electron, developers will need to handle the select-bluetooth-device event on the webContents associated with the device request.
    // This example demonstrates an Electron application that automatically selects the first available bluetooth device when the Test Bluetooth button is clicked.
    contents.on('select-bluetooth-device', (event, deviceList, callback) =>
    {
        event.preventDefault();
        if (deviceList && deviceList.length > 0)
        {
            callback(deviceList[0].deviceId);
        }
    });

    win.loadFile('index.html').then(() =>
    {
        console.log("index.html file loaded and this extra bit of code resolves the promise.")
    })

    // win.once('ready-to-show', () =>
    // {
    //     win.show()
    // })

    const INCREMENT = 0.03
    const INTERVAL_DELAY = 100 // ms

    let counter = 0
    progressInterval = setInterval(() =>
    {
        win.setProgressBar(counter)

        if (counter < 2)
            counter += INCREMENT
        else
            counter = (-INCREMENT * 5) // reset to a bit less than 0 to show reset state

    }, INTERVAL_DELAY);
}

// before the app is terminated, clear both timers
app.on('before-quit', () => {
    clearInterval(progressInterval)
})

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

    app.on('activate', () =>
    {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    globalShortcut.register('Alt+Shift+I', () =>
    {
        console.log('Electron loves global shortcuts!')
    })

}).then(createWindow).then(showNotification)

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin') app.quit()
})

app.setAppUserModelId(process.execPath);

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
