// Uses context bridge...

const titleButton = document.getElementById('btn')
titleButton.addEventListener('click', () =>
{
    window.myAPI.setTitle("Leon's Title");
})


