/**
 * TurboPing - Main Electron Process
 */

const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const optimizer = require('./engine/optimizer');
const dnsBenchmark = require('./engine/dnsBenchmark');
const mtuCalculator = require('./engine/mtuCalculator');
const gameRadar = require('./engine/gameRadar');

let mainWindow = null;
let tray = null;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  const iconIco = path.join(__dirname, 'assets', 'icon.ico');
  const iconPng = path.join(__dirname, 'assets', 'icon.png');
  const iconPath = fs.existsSync(iconIco) ? iconIco : (fs.existsSync(iconPng) ? iconPng : undefined);

  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 920,
    minHeight: 640,
    title: 'TurboPing — Gaming Latency & Network Optimizer',
    icon: iconPath,
    frame: false,
    backgroundColor: '#090d16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Window Controls
ipcMain.on('window-action', (_e, action) => {
  if (!mainWindow) return;
  if (action === 'minimize') mainWindow.minimize();
  else if (action === 'maximize') {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  } else if (action === 'close') {
    mainWindow.close();
  }
});

// IPC Optimization Handlers
ipcMain.handle('get-adapters', async () => {
  return await optimizer.getActiveAdapters();
});

ipcMain.handle('check-status', async () => {
  return await optimizer.checkOptimizationStatus();
});

ipcMain.handle('apply-optimizations', async () => {
  return await optimizer.applyGamingOptimizations();
});

ipcMain.handle('restore-defaults', async () => {
  return await optimizer.restoreWindowsDefaults();
});

// DNS Handlers
ipcMain.handle('benchmark-dns', async () => {
  return await dnsBenchmark.benchmarkDNS();
});

ipcMain.handle('apply-dns', async (_e, { adapterName, primary, secondary }) => {
  return await dnsBenchmark.applyDNS(adapterName, primary, secondary);
});

ipcMain.handle('restore-default-dns', async (_e, { adapterName }) => {
  return await dnsBenchmark.restoreDefaultDNS(adapterName);
});

// MTU Handlers
ipcMain.handle('find-optimal-mtu', async () => {
  return await mtuCalculator.findOptimalMTU();
});

ipcMain.handle('apply-mtu', async (_e, { adapterName, mtuValue }) => {
  return await mtuCalculator.applyMTU(adapterName, mtuValue);
});

// Game Radar Handlers
ipcMain.handle('scan-games', async () => {
  return await gameRadar.scanGameServers();
});
