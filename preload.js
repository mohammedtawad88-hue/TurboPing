const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('turboPing', {
  getAdapters: () => ipcRenderer.invoke('get-adapters'),
  checkStatus: () => ipcRenderer.invoke('check-status'),
  applyOptimizations: () => ipcRenderer.invoke('apply-optimizations'),
  restoreDefaults: () => ipcRenderer.invoke('restore-defaults'),

  benchmarkDNS: () => ipcRenderer.invoke('benchmark-dns'),
  applyDNS: (adapterName, primary, secondary) => ipcRenderer.invoke('apply-dns', { adapterName, primary, secondary }),
  restoreDefaultDNS: (adapterName) => ipcRenderer.invoke('restore-default-dns', { adapterName }),

  findOptimalMTU: () => ipcRenderer.invoke('find-optimal-mtu'),
  applyMTU: (adapterName, mtuValue) => ipcRenderer.invoke('apply-mtu', { adapterName, mtuValue }),

  scanGames: () => ipcRenderer.invoke('scan-games'),

  windowAction: (action) => ipcRenderer.send('window-action', action)
});
