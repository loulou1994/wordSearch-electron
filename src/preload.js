// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadApp_API: (pageInfo) => ipcRenderer.send('resize-window', pageInfo),
  convertToPDF: async (wordsData, filePath) => {
    try {
      return await ipcRenderer.invoke('generate-pdfs', wordsData, filePath);
    } catch (err) {
      throw err;
    }
  },

  loadOsFonts: async () => {
    try {
      return await ipcRenderer.invoke('upload-fonts');
    } catch (err) {
      throw new Error(err);
    }
  },
  openDialog: async () => {
    return await ipcRenderer.invoke('open-dialog');
  },
  alertMessage: (message) => {
    ipcRenderer.send('display-message', message);
  },
});
