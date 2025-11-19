// Preload script — provide safe minimal bridge if needed
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveJSON: (jsonFileName, newData) => {
    return ipcRenderer.invoke('save-json-file', jsonFileName, newData);
  },
  readJSON: (jsonFileName) => {
    return ipcRenderer.invoke('read-json-file', jsonFileName);
  },
  updateChecker: (localVersion, user, repo) => {
    return ipcRenderer.invoke('update-checker', localVersion, user, repo);
  },
  getAppVersion: () => {
    return ipcRenderer.invoke('get-app-version');
  },
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  close: () => ipcRenderer.send('close')
});