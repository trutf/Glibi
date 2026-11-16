const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  close: () => ipcRenderer.send("window-close"),
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  startDownload: (options) => ipcRenderer.send("start-game-download", options),
  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress-update", (_event, data) => callback(data));
  },
  getInstalledGames: () => ipcRenderer.invoke("get-installed-games"),
  openGameFolder: (folderPath) => ipcRenderer.send("open-game-folder", folderPath),
  uninstallGame: (gameTitle) => ipcRenderer.invoke("uninstall-game", gameTitle),
});
