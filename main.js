const { app, BrowserWindow } = require('electron')
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

    win.loadFile('index.html').then(() =>
    {
        console.log("index.html file loaded and this extra bit of code resolves the promise.")
    })
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
