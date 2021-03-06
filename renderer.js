// Uses context bridge...

// A common application for two-way IPC is calling a main process module from your renderer process code and waiting for a result. This can be done by using ipcRenderer.invoke paired with ipcMain.handle.

const titleButton = document.getElementById('btn');
const titleInput = document.getElementById('title');
const filePathElement = document.getElementById('filePath');

const NOTIFICATION_TITLE = 'Title'
const NOTIFICATION_BODY = 'Notification from the Renderer process. Click to log to console.'
const CLICK_MESSAGE = 'Notification clicked!'

new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY })
    .onclick = () => document.getElementById("output").innerText = CLICK_MESSAGE;

titleButton.addEventListener('click', async () =>
{
    // In the above snippet, we listen for clicks on the #btn button, and call our window.electronAPI.openFile()
    // API to activate the native Open File dialog. We then display the selected file path in the #filePath element.
    const filePath = await window.myAPI.openFile();
    const title = titleInput.value;
    filePathElement.innerText = filePath;
    window.myAPI.setTitle(title);
});

// Finally, to make the values update in the HTML document, we'll add a few lines of DOM manipulation so that the value
// of the #counter element is updated whenever we fire an update-counter event.
const counter = document.getElementById('counter')
// In the below code, we're passing in a callback to the window.electronAPI.onUpdateCounter function exposed from our preload script.
// The second value parameter corresponds to the 1 or -1 we were passing in from the webContents.send call from the native menu.
window.myAPI.onUpdateCounter((_event, value) =>
{
    const oldValue = Number(counter.innerText)
    const newValue = oldValue + value
    counter.innerText = newValue
});

async function testBluetooth()
{
    const device = await navigator.bluetooth.requestDevice(
    {
        acceptAllDevices: true
    })
    document.getElementById('device-name').innerHTML = "Response device ID: " + `${device.id}`;
}

document.getElementById('bluetooth').addEventListener('click', testBluetooth)


