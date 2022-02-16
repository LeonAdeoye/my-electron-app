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
