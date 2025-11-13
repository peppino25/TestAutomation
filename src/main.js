import { app, ipcMain, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

// 🧠 Move win here so other functions can see it
let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    minHeight: 700,
    minWidth: 1000,
    frame: false,
    resizable: false,
    transparent: true,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setMenu(null);

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  function resolveResourcePath(jsonFileName) {
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

  // 🧩 Now win is visible here
  ipcMain.on("minimize", () => win.minimize());
  ipcMain.on("maximize", () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on("close", () => win.close());
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
