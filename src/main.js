import { app, ipcMain } from "electron";
import fs from "fs";
import path from "path";

// Main process entry for Electron
const { BrowserWindow } = require('electron');

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  function resolveResourcePath(jsonFileName) {
  // Always sanitize filename to prevent directory traversal (security!)
  const safeName = path.basename(jsonFileName);
  return path.join(app.getAppPath(), "resources", safeName);
  }

  ipcMain.handle("save-json-file", async (event, jsonFileName, newData) => {
    try {
      const filePath = resolveResourcePath(jsonFileName);
      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), "utf8");
      return { success: true, path: filePath };
    } catch (err) {
      console.error("Error saving JSON:", err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("read-json-file", async (event, jsonFileName) => {
    try {
      const filePath = resolveResourcePath(jsonFileName);
      if (!fs.existsSync(filePath)) {
        return { success: false, error: `File not found: ${jsonFileName}` };
      }
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    } catch (err) {
      console.error("Error reading JSON:", err);
      return { success: false, error: err.message };
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS it's common for apps to stay open until user quits explicitly
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});