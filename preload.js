const { spawn } = require("child_process");
const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const { basename } = require("path");
const path = require("path");

let loadCode;

contextBridge.exposeInMainWorld("initCodeLoader", (codeLoader) => {
  loadCode = codeLoader;

  const name = "D:/Project/Divisi Pendidikan/Borland X/latihan-1/main.c";
  fs.readFile(name, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    loadCode(name, data);
  });
});

contextBridge.exposeInMainWorld("darkMode", {
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system"),
});

const folder = "D:/Project/Divisi Pendidikan/Borland X/latihan-1";

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#run-button").onclick = () => {
    spawn("start cmd", [`/c "main & pause>nul"`], {
      cwd: folder,
      shell: true,
    });
  };

  const explorer = document.querySelector("#explorer>ul");

  document.querySelector("#explorer>li").textContent = basename(folder);
  fs.readdirSync(folder).forEach((fileName) => {
    const file = document.createElement("li");
    file.textContent = fileName;
    file.onclick = (event) => {
      explorer.childNodes.forEach((child) => child.classList.remove("active"));
      event.target.classList.add("active");
      fs.readFile(`${folder}/${fileName}`, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        loadCode(`${folder}/${fileName}`, data);
      });
    };
    explorer.appendChild(file);
  });
});
