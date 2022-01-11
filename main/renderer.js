const editorViews = {};

window.initCodeLoader((name, code) => {
  for (let name in editorViews) {
    editorViews[name].hidden = true;
  }
  const editorView = editorViews[name];
  if (editorView) {
    editorView.hidden = false;
  } else {
    editorViews[name] = new EditorView({
      state: EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          cpp(),
          indentUnit.of("    "),
        ],
      }),
      parent: document.querySelector("#editor"),
    }).dom;
  }
});

document.querySelector("#toggle-dark-mode").onclick = async () => {
  const isDarkMode = await window.darkMode.toggle();
  document.querySelector("#theme-source").innerHTML = isDarkMode
    ? "Dark"
    : "Light";
};

document.querySelector("#reset-to-system").onclick = async () => {
  await window.darkMode.system();
  document.querySelector("#theme-source").innerHTML = "System";
};
