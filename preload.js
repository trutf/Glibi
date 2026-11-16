const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  close: () => ipcRenderer.send("window-close"),
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  startDownload: (options) => ipcRenderer.send("start-game-download", options),
  pauseDownload: (gameTitle) => ipcRenderer.send("pause-game-download", gameTitle),
  resumeDownload: (gameTitle) => ipcRenderer.send("resume-game-download", gameTitle),
  cancelDownload: (gameTitle) => ipcRenderer.send("cancel-game-download", gameTitle),
  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress-update", (_event, data) => callback(data));
  },
  getInstalledGames: () => ipcRenderer.invoke("get-installed-games"),
  openGameFolder: (folderPath) => ipcRenderer.send("open-game-folder", folderPath),
  uninstallGame: (gameTitle) => ipcRenderer.invoke("uninstall-game", gameTitle),
  launchGame: (gameTitle) => ipcRenderer.invoke("launch-game", gameTitle),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  getAvailableWine: () => ipcRenderer.invoke("get-available-wine"),
});
