const { contextBridge, ipcRenderer } = require('electron')

// Accessing this information is trivial to do in the main process through Node's global process object.
// However, you can't just edit the DOM from the main process because it has no access to the renderer's
// document context. They're in entirely different processes!
// This is where attaching a preload script to your renderer comes in handy.
// A preload script runs before the renderer process is loaded, and has access to both renderer globals
// (e.g. window and document) and a Node.js environment.

window.addEventListener('DOMContentLoaded', () =>
{
    const replaceText = (selector, text) =>
    {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron'])
    {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
})

// Context Isolation means that preload scripts are isolated from the renderer's main world to avoid
// leaking any privileged APIs into your web content's code.
// Instead, use the contextBridge module to accomplish this securely:

// Using a preload script to import Node.js and Electron modules in a context-isolated renderer process.
contextBridge.exposeInMainWorld('myAPI', {
    desktop: true,
    // To send messages to the listener created above, you can use the ipcRenderer.send API.
    // By default, the renderer process has no Node.js or Electron module access.
    // As an app developer, you need to choose which APIs to expose from your preload
    // script using the contextBridge API.
    setTitle: (title) => ipcRenderer.send('set-title', title)
})
