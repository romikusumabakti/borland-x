require.config({ paths: { vs: "./node_modules/monaco-editor/min/vs" } });

let editor;

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.querySelector("#editor>.tab-contents"), {
    language: "c",
    automaticLayout: true,
    theme: "vs-light"
  });

  const themeToggle = document.getElementById("theme-toggle");

  themeToggle.onclick = async () => {
    const dark = await window.api.toggleTheme();
    themeToggle.textContent = dark ? "Dark theme" : "Light theme";
    monaco.editor.setTheme(dark ? "vs-dark" : "vs-light");
  };
});

const backdrop = document.getElementById("backdrop");
const splash = document.getElementById("splash");
const startButton = document.getElementById("start-button");

function closeSplash() {
  backdrop.hidden = true;
  splash.hidden = true;
}

startButton.onclick = closeSplash;
backdrop.onclick = closeSplash;

const panel = document.getElementById("panel");
const panelTabButtons = panel.getElementsByClassName("tab-buttons")[0];
const panelTabContents = panel.getElementsByClassName("tab-contents")[0];

let currentPanelTab;

const panelTabs = [
  {
    id: "problems",
    title: "Problems",
  },
  {
    id: "debug-console",
    title: "Debug console",
  },
  {
    id: "terminal",
    title: "Terminal",
  },
];

panelTabs.forEach((tab) => {
  const content = document.createElement("textarea");
  content.readOnly = true;
  content.hidden = true;
  panelTabContents.appendChild(content);
  tab.content = content;

  const button = document.createElement("button");
  button.textContent = tab.title;
  button.onclick = () => {
    currentPanelTab.content.hidden = true;
    currentPanelTab.button.classList.remove("active");
    currentPanelTab = tab;
    content.hidden = false;
    button.classList.add("active");
  };
  panelTabButtons.appendChild(button);
  tab.button = button;

  currentPanelTab = tab;
});
currentPanelTab.content.hidden = false;
currentPanelTab.button.classList.add("active");

const commands = {
  openFolder: {
    label: "Open folder",
    icon: "folder",
    action: async (e) => {
      e.target.disabled = true;
      const data = await window.api.openFolder();
      editor.setValue(data);
      e.target.disabled = false;
    },
  },
  save: {
    label: "Save",
    icon: "save",
    action: async () => await window.api.writeFile(editor.getValue()),
  },
  build: {
    label: "Build",
    icon: "gear",
    action: async (e) => {
      e.target.disabled = true;
      await window.api.build((stderr) => panelTabs[0].content.value += stderr);
      e.target.disabled = false;
    },
  },
  debug: {
    label: "Debug",
    icon: "debug-alt-small",
    action: (e) => {
      e.target.disabled = true;
      window.api.debug(() => e.target.disabled = false);
    },
  },
  run: {
    label: "Run",
    icon: "play",
    action: async () => console.log(await window.api.openFolder()),
  },
};

const toolbarCommands = [
  commands.openFolder,
  commands.save,
  commands.build,
  commands.debug,
  commands.run,
];

const leftToolbar = document.getElementById("left-toolbar");

toolbarCommands.forEach((command) => {
  const button = document.createElement("button");
  button.classList.add("codicon", `codicon-${command.icon}`);
  button.title = command.label;
  button.onclick = command.action;
  leftToolbar.appendChild(button);
});