// Modules to control application life and create native browser window
const {app, BrowserWindow,ipcMain,dialog} = require('electron')
const nativeImage = require('electron').nativeImage;
const updater = require('./updater.js') //  setup your own autoUpdater 'updater.js'
// for more info refer here https://www.electron.build/auto-update.html
var image = nativeImage.createFromPath(__dirname + '/icon/actualv2.png'); 

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame:false,
    center:true,
    minWidth:800,
    minHeight:600,
    icon:image,
    webPreferences: {
      nodeIntegration:true,
      devTools:false
    }
  })
  
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools before set devTools to true.
  // mainWindow.webContents.openDevTools()
}



function createShortcutWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    center:true,
    minWidth:800,
    minHeight:600,
    icon:image,
    webPreferences: {
      nodeIntegration:false,
      devTools:false
    }
  })
  mainWindow.removeMenu()
  mainWindow.loadFile('shortcut.html')
}

ipcMain.on('showShortcut',()=>{
  createShortcutWindow()
})

ipcMain.on('create-new-instance',()=>{
  createWindow();
})

ipcMain.on('get-file-data', function(event) {
  if (process.platform == 'win32' && process.argv.length >= 2) {
    var openFilePath = process.argv[1]
    data = openFilePath
  }
  event.returnValue = openFilePath;
});

app.whenReady().then(() => {
  createWindow()
  // setTimeout(updater,3000) enable this after you set your updater.js
  app.on('activate', function () {
    
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', function () {
  
  if (process.platform !== 'darwin') app.quit()
})

