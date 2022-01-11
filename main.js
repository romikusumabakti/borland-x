const { app, BrowserWindow, Menu, ipcMain, nativeTheme } = require("electron");
const path = require("path");

const template = [
  {
    label: "File",
    submenu: [
      {
        label: "Buka file...",
      },
      {
        label: "Buka folder...",
      },
      {
        role: "close",
        label: "Keluar",
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "delete" },
      { type: "separator" },
      { role: "selectAll" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    label: "Build",
    submenu: [
      {
        label: "Run",
      },
    ],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Documentation",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://electronjs.org");
        },
      },
      { type: "separator" },
      {
        label: "About",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
  ipcMain.handle("dark-mode:toggle", () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = "light";
    } else {
      nativeTheme.themeSource = "dark";
    }
    return nativeTheme.shouldUseDarkColors;
  });

  ipcMain.handle("dark-mode:system", () => {
    nativeTheme.themeSource = "system";
  });

  const main = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    frame: false,
  });
  main.loadFile("./main/index.html");

  const splash = new BrowserWindow({
    parent: main,
    width: 450,
    height: 310,
    frame: false,
    resizable: false,
    show: false,
  });

  main.once("ready-to-show", () => {
    main.show();
    splash.loadFile("./splash/index.html");
    splash.once("ready-to-show", () => {
      splash.show();
    });
  });
});
