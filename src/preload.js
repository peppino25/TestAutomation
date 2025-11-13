// Preload script — provide safe minimal bridge if needed
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveJSON: (jsonFileName, newData) => {
    return ipcRenderer.invoke('save-json-file', jsonFileName, newData);
  },
  readJSON: (jsonFileName) => {
    return ipcRenderer.invoke('read-json-file', jsonFileName);
  },
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  close: () => ipcRenderer.send('close')
});