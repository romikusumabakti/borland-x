const {
  app,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  dialog,
} = require("electron");
const fs = require("fs");
const path = require("path");

const titleBarOverlay = {
  light: {
    color: "#fff",
    symbolColor: "#222",
    height: 30,
  },
  dark: {
    color: "#222",
    symbolColor: "#fff",
    height: 30,
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // nodeIntegration: true,
      // contextIsolation: false,
      enableWebSQL: false,
      spellcheck: false
    },
    titleBarStyle: "hidden",
    titleBarOverlay: nativeTheme.shouldUseDarkColors ? titleBarOverlay.dark : titleBarOverlay.light,
  });

  window.loadFile("index.html");

  // window.webContents.openDevTools()
  
  ipcMain.handle("dark-mode:check", () => nativeTheme.shouldUseDarkColors)

  ipcMain.handle("dark-mode:toggle", () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = "light";
      window.setTitleBarOverlay(titleBarOverlay.light);
    } else {
      nativeTheme.themeSource = "dark";
      window.setTitleBarOverlay(titleBarOverlay.dark);
    }
    return nativeTheme.shouldUseDarkColors;
  });

  ipcMain.handle("dark-mode:system", () => {
    nativeTheme.themeSource = "system";
  });

  ipcMain.handle("dialog:open-file", async () => {
    const { filePaths } = await dialog.showOpenDialog();
    return filePaths[0];
  });

  ipcMain.handle(
    "dialog:open-folder",
    async () =>
      await dialog.showOpenDialog({
        properties: ["openDirectory"],
      })
  );

  ipcMain.handle("file:read", (_, path) => fs.readFileSync(path, "utf8"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
