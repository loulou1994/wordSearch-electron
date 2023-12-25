const path = require('path');
const {
  app,
  BrowserWindow,
  ipcMain,
  protocol,
  net,
  dialog,
} = require('electron');
const SystemFonts = require('system-font-families').default;
const generatePdfs = require('./scripts/genPdfFiles');
if (require('electron-squirrel-startup')) {
  app.quit();
}
// Handle creating/removing shortcuts on Windows when installing/uninstalling.

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    useContentSize: true,
    width: 526,
    height: 296,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    center: true,
    // resizable: false,
  });

  // console.log(APP_WINDOW_WEBPACK_ENTRY, MAIN_WINDOW_WEBPACK_ENTRY)
  ipcMain.on('resize-window', (_, pageInfo) => {
    mainWindow.loadURL(
      pageInfo.page === 'app'
        ? APP_WINDOW_WEBPACK_ENTRY
        : MAIN_WINDOW_WEBPACK_ENTRY
    );
    mainWindow.setContentSize(pageInfo.width, pageInfo.height);
    mainWindow.center();
  });
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  // Customize protocol to handle static resource.
  protocol.handle('static', (request) => {
    const fileUrl = request.url.replace('static://', '');
    const filePath = path.join(app.getAppPath(), '.webpack/renderer', fileUrl);
    return net.fetch(filePath);
  });
  ipcMain.on('display-message', (_, message) => {
    dialog.showMessageBox({
      type: 'info',
      message,
    });
  });
  ipcMain.handle('upload-fonts', async () => {
    const systemFonts = new SystemFonts();
    try {
      const fonts = await systemFonts.getFonts();
      return fonts;
    } catch (err) {
      throw new Error('Error occured while loading fonts: ' + err);
    }
  });

  ipcMain.handle('open-dialog', () => {
    return dialog.showSaveDialogSync({
      title: 'Save File',
      properties: ['createDirectory', 'showOverwriteConfirmation'],
      filters: [{ name: 'All Files', extensions: ['*'] }],
    });
  });
  ipcMain.handle('generate-pdfs', async (_, wordsData, filePath) => {
    try {
      const printingSucceeded = await generatePdfs(wordsData, filePath);
      return printingSucceeded;
    } catch (err) {
      throw new Error(err); 
    }
  });
  createWindow();
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
