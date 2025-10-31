// Preload script — provide safe minimal bridge if needed
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  hello: () => 'Hello from preload!'
});