// imports
const { remote, shell, ipcRenderer } = require('electron')
const FindInPage = require('electron-find').FindInPage;
const Store = require('electron-store');
const Mousetrap = require('mousetrap');
require('mousetrap/plugins/bind-dictionary/mousetrap-bind-dictionary')
const path = require('path')
const fs = require('fs')
const pell = require('pell')
const { version } = require('./package.json')
var TurndownService = require('turndown')
var markdownpdf = require("markdown-pdf")





// Variable declaration and DOM Objects
var editor = pell.init({
  element: document.getElementById('editor'),
  defaultParagraphSeparator: 'div',
  onChange: html => onChangepell(html),
  actions: [],
})
const pellContent = document.querySelector('.pell-content')
const fileName = document.querySelector('.filename')
const url = document.getElementById('url')
const urltext = document.getElementById('urltext')
const addlink = document.getElementById('addlink')
const store = new Store();
var current_window = remote.BrowserWindow.getFocusedWindow();
const themeInput = document.getElementById('theme')
const fontSizeInput = document.getElementById('fontSize')
const lineHeightInput = document.getElementById('lineHeight')
const font = document.getElementById('font')
var vers = document.getElementById('version')
var settingsObj
pellContent.classList.add('mousetrap')
let findInPage = new FindInPage(remote.getCurrentWebContents(), {
  duration: 200,
  offsetTop: 50,
});




// generate/reload userSettings
document.addEventListener("DOMContentLoaded", (e) => {
  vers.innerText = version
  const configPath = `${remote.app.getPath('userData')}\\config.json`
  if (fs.existsSync(configPath)) {
    updateEditorSetting(store.store)
  }
  else {
    store.set('Theme', 'Light')
    store.set('fontSize', '26')
    store.set('lineHeight', '35')
    store.set('font', 'Product-Sans')
  }
  const openPath = ipcRenderer.sendSync('get-file-data');
  if (openPath !== null && openPath !== '.') {
    putContent(openPath)
  }
})




//Window Event Handling
function openMenu() {
  var menuBar = document.querySelector('#wrapper')
  var menuIcon = document.querySelector('.menuicon')
  if (menuIcon.classList.contains('fa-arrow-left')) {
    menuIcon.classList.toggle('fa-arrow-right')
  }
  else {
    menuIcon.classList.toggle('fa-arrow-left')
  }
  menuBar.classList.toggle('toggled')
}
function onChangepell(html) {
}
function maximizeW() {
  current_window.isMaximized() ? current_window.unmaximize() : current_window.maximize();
}
function minimizeW() {
  current_window.minimize();
}
function closeW() {
  current_window.close()
}




// Binding KeyBoard Shorcuts
Mousetrap.bind({
  'mod+n': () => {
    openNewInstance()
  },
  'mod+s': () => {
    save()
  },
  'mod+`': () => {
    pell.exec('strikethrough')
  },
  'mod+1': () => {
    pell.exec('formatBlock', '<h1>');
  },
  'mod+2': () => {
    pell.exec('formatBlock', '<h2>');
  },
  'mod+3': () => {
    pell.exec('formatBlock', '<h3>');
  },
  'mod+4': () => {
    pell.exec('formatBlock', '<h4>');
  },
  'mod+5': () => {
    pell.exec('formatBlock', '<h5>');
  },
  'mod+6': () => {
    pell.exec('formatBlock', '<h6>');
  },
  'mod+h': () => {
    var text = window.getSelection().toString().length
    var textStyle = window.getSelection().anchorNode.parentNode.style
    if (text !== 0) {
      if (textStyle.cssText === "") {
        pell.exec('backColor', 'yellow')
      }
      else {
        textStyle.cssText = ""
      }
    }
  },
  'mod+tab': () => {
    pell.exec('indent');
  },
  'mod+shift+c': () => {
    pell.exec('justifyCenter');
  },
  'mod+shift+x': () => {
    pell.exec('justifyLeft');
  },
  'mod+shift+v': () => {
    pell.exec('justifyRight');
  },
  'mod+up': () => {
    pell.exec('superscript');
  },
  'mod+down': () => {
    pell.exec('subscript');
  },
  'mod+f': () => {
    findInPage.openFindWindow()
  },
  'shift+tab': () => {
    pell.exec('outdent');
  },
  'alt+c': () => {
    pell.exec('formatBlock', '<pre>');
  },
  'alt+a': () => {
    $('#linkModal').modal('toggle')
  },
  'alt+1': () => {
    pell.exec('insertOrderedList');
  },

  'alt+.': () => {
    pell.exec('insertUnorderedList');
  },
  'alt+l': () => {
    pell.exec('insertHorizontalRule');
  },
  'alt+t': () => {
    pell.exec('insertHTML', '<div class="todo">[❌]&nbsp</div>')
  },
  'alt+y': () => {
    const todoDiv = window.getSelection().anchorNode.parentNode
    if (todoDiv.classList.contains('todo')) {
      var text = todoDiv.innerText.replace('❌', '✔')
      todoDiv.innerText = text
    }
  },
  'alt+2': () => {
    pell.exec('fontSize', 2)
  },
  'alt+3': () => {
    pell.exec('fontSize', 4)
  },
  'alt+4': () => {
    pell.exec('fontSize', 6)
  },
  'alt+5': () => {
    pell.exec('fontSize', 7)
  },
  'alt+0': () => {
    pell.exec('insertHTML', '<div>&nbsp;</div>')
  },
  'alt+d': () => {
    const dateObj = new Date()
    pell.exec('insertHTML', `<div>${dateObj.toDateString()}</div>`)
  },

});
//Core Logic

addlink.addEventListener('click', (e) => { //triggred from link modal 'addLink' button
  e.preventDefault()
  const userUrl = url.value
  const usertext = urltext.value
  var a = document.createElement('a');
  var link = document.createTextNode(usertext);
  a.appendChild(link);
  a.title = usertext;
  a.href = userUrl;
  a.id = 'openLink'
  editor.content.appendChild(a);
  $('#linkModal').modal('hide')
  url.value = ""
  urltext.value = ""
})
pellContent.addEventListener('click', (e) => //to open links in default browser whwen clicked
{
  if (e.target.id === 'openLink') {
    shell.openExternal(e.target.href)
  }
})

function openSettings() {
  $('#settingsModal').modal('toggle')
}

function openGithub() {
  shell.openExternal('https://github.com/AsishRaju/FirePad')
}

function openNewInstance() {
  ipcRenderer.send('create-new-instance')
}

function openShortcut() {
  ipcRenderer.send('showShortcut')
}

editor.content.addEventListener("dblclick", (e) => {
  openMenu()
});

pellContent.addEventListener("paste", function (e) {
  e.preventDefault();
  var text = e.clipboardData.getData('text/plain');
  document.execCommand("insertHTML", false, text);
});


function save() {
  var savePath = remote.dialog.showSaveDialogSync({
    filters: [
      { name: 'Pad File', extensions: ['pad'] },
      { name: 'Text File', extensions: ['txt'] },
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'Markdown', extensions: ['md'] },
    ],
    defaultPath: remote.app.getPath('desktop').toString() + `\\${fileName.innerText}`

  });
  fileName.innerText = path.basename(savePath).replace(path.extname(savePath), "")
  if (savePath.includes('.txt')) {
    fs.writeFileSync(savePath, editor.content.innerText, 'utf8')
  }
  else if (savePath.includes('.pad')) {
    fs.writeFileSync(savePath, editor.content.innerHTML, 'utf8')
  } else {
    var turndownService = new TurndownService()
    var markdown = turndownService.turndown(editor.content.innerHTML)
    if (savePath.includes('.md')) {
      fs.writeFileSync(savePath, markdown, 'utf8')
    } else if (savePath.includes('.pdf')) {
      markdownpdf().from.string(markdown).to(savePath, function () {
        console.log("Done")
      })
    }
  }
}

function openFile() {
  var openPath = remote.dialog.showOpenDialogSync({
    filters: [
      { name: 'Pad Files', extensions: ['pad'] },
      { name: 'Text Files', extensions: ['txt'] },
    ],
    defaultPath: remote.app.getPath('desktop').toString(),

  })
  openPath = openPath[0].toString()
  putContent(openPath)
}

function putContent(openPath) {
  fileName.innerText = path.basename(openPath)
  const fileData = fs.readFileSync(openPath, { encoding: 'utf8', flag: 'r' })
  if (openPath.includes('.txt')) {
    editor.content.innerText = fileData
  }
  else {
    editor.content.innerHTML = fileData
  }
}
function openAbout() {
  $('#aboutModal').modal('toggle')
}
function saveSettings() {

  settingsObj = {
    'Theme': themeInput.value,
    'fontSize': fontSizeInput.value,
    'lineHeight': lineHeightInput.value,
    'font': font.value
  }
  updateEditorSetting(settingsObj)
  $('#settingsModal').modal('hide')
}

function resetSettings() {
  settingsObj = {
    'Theme': 'Light',
    'fontSize': '30',
    'lineHeight': '35',
    'font': 'Consolas'
  }
  themeInput.value = settingsObj.Theme
  updateEditorSetting(settingsObj)
  $('#settingsModal').modal('hide')
}

function updateEditorSetting(settingsObj) {
  if (settingsObj.Theme === 'Dark') {
    pellContent.style.backgroundColor = '#121212';
    pellContent.style.color = 'white';
  }
  else {
    pellContent.style.backgroundColor = 'white';
    pellContent.style.color = 'black';
  }
  pellContent.style.fontFamily = `${settingsObj.font}`
  pellContent.style.fontSize = `${settingsObj.fontSize}px`
  pellContent.style.lineHeight = `${settingsObj.lineHeight}px`
  themeInput.value = settingsObj.Theme
  fontSizeInput.value = settingsObj.fontSize
  lineHeightInput.value = settingsObj.lineHeight
  store.set('Theme', settingsObj.Theme)
  store.set('fontSize', settingsObj.fontSize)
  store.set('lineHeight', settingsObj.lineHeight)
  store.set('font', settingsObj.font)
}