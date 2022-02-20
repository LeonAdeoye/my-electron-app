// Uses context bridge...

// A common application for two-way IPC is calling a main process module from your renderer process code and waiting for a result. This can be done by using ipcRenderer.invoke paired with ipcMain.handle.

const titleButton = document.getElementById('btn')
const filePathElement = document.getElementById('filePath')

titleButton.addEventListener('click', async () =>
{
    // In the above snippet, we listen for clicks on the #btn button, and call our window.electronAPI.openFile()
    // API to activate the native Open File dialog. We then display the selected file path in the #filePath element.
    const filePath = await window.myAPI.openFile()

    filePathElement.innerText = filePath

    window.myAPI.setTitle("Leon's Title");
})


