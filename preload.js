const { spawn } = require("child_process");
const path = require("path");
const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const Split = require("split.js");

window.addEventListener("DOMContentLoaded", () => {
  // Split(["#sidebar", "#content-2"], {
  //   sizes: [15, 85],
  //   gutterSize: 4,
  //   snapOffset: 0,
  //   cursor: "e-resize",
  // });
  Split(["#editor", "#panel"], {
    sizes: [70, 30],
    gutterSize: 4,
    snapOffset: 0,
    direction: "vertical",
    cursor: "n-resize",
  });
});

let folderPath;
let fileName;
let programName;

contextBridge.exposeInMainWorld("api", {
  checkTheme: () => ipcRenderer.invoke("dark-mode:check"),
  toggleTheme: () => ipcRenderer.invoke("dark-mode:toggle"),
  systemTheme: () => ipcRenderer.invoke("dark-mode:system"),

  openFolder: async () => {
    const filePath = await ipcRenderer.invoke("dialog:open-file");
    if (filePath) {
      folderPath = path.dirname(filePath);
      fileName = path.basename(filePath);
      return fs.readFileSync(`${folderPath}\\${fileName}`, "utf8");
    }
  },

  readFile: () => fs.readFileSync(`${folderPath}\\${fileName}`, "utf8"),

  writeFile: (data) => fs.writeFileSync(`${folderPath}\\${fileName}`, data),

  build: (stderr) => {
    programName = fileName.replace(/\.[^/.]+$/, "");
    const compile = spawn(".\\mingw64\\bin\\gcc", [
      "-g",
      `${folderPath}\\${fileName}`,
      "-o",
      `${folderPath}\\${programName}`,
    ]);

    compile.stderr.on("data", (data) => {
      stderr(data.toString());
    });

    compile.on("close", (code) => {
      return code;
    });
  },

  debug: (success) => {
    const debug = spawn(
      ".\\mingw64\\bin\\gdb",
      [
        `"${folderPath}\\${programName}"`,
        "-batch",
        "-ex",
        '"set new-console on"',
        "-ex",
        "run",
      ],
      { shell: true }
    );

    debug.stdout.on("data", (data) => {
      console.log(data.toString());

      // const rows = data.toString().split("\n");
      // if (rows[1].includes("SIGFPE")) {
      //   console.log("Exception has occurred.");
      //   console.log(`${rows[1].split(" SIGFPE, ")[1]}`);
      //   const func = rows[2].split(" in ")[1].split(" () at ")[0] + "()";
      //   const file = rows[2].split(" at ")[1].split(":")[0];
      //   const line = rows[2].split(":")[1];
      //   console.log(`Di ${file} function ${func} baris ke-${line}.`);
      // }
    });

    debug.on("close", () => {
      success();
    });
  },
});
