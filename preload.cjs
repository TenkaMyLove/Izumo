const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveLocalBackup: (data) => ipcRenderer.send('save-local-backup', data),
});
