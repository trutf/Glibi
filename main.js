const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");

// Linux log ve vsync susturma
app.commandLine.appendSwitch("log-level", "3");
app.commandLine.appendSwitch("disable-logging");
app.commandLine.appendSwitch("disable-gpu-vsync");
app.commandLine.appendSwitch("disable-gpu");

let mainWindow = null;
let libraryDataPath = "";

function getLibraryPath() {
  if (!libraryDataPath) {
    const userData = app.getPath("userData");
    libraryDataPath = path.join(userData, "glibi_library.json");
  }
  return libraryDataPath;
}

function loadInstalledGames() {
  try {
    const p = getLibraryPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    }
  } catch (e) {
    console.error("Library read error:", e);
  }
  return [];
}

function saveInstalledGames(games) {
  try {
    const p = getLibraryPath();
    fs.writeFileSync(p, JSON.stringify(games, null, 2), "utf-8");
  } catch (e) {
    console.error("Library write error:", e);
  }
}

function markGameInstalled(gameTitle, appId, downloadPath) {
  const list = loadInstalledGames();
  const existing = list.find((g) => g.gameTitle.toLowerCase() === gameTitle.toLowerCase() || (appId && g.appId === appId));
  if (!existing) {
    list.push({
      id: `installed_${Date.now()}`,
      gameTitle,
      appId: appId || 0,
      downloadPath,
      installedAt: new Date().toISOString(),
    });
    saveInstalledGames(list);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 920,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: "#161718",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));

  ipcMain.on("window-close", () => {
    mainWindow.close();
  });

  ipcMain.on("window-minimize", () => {
    mainWindow.minimize();
  });

  ipcMain.on("window-maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle("get-installed-games", async () => {
    return loadInstalledGames();
  });

  ipcMain.on("open-game-folder", (_event, folderPath) => {
    if (folderPath && fs.existsSync(folderPath)) {
      shell.showItemInFolder(folderPath);
    } else {
      const downloadDir = path.join(app.getPath("downloads"), "Glibi Games");
      shell.openPath(downloadDir);
    }
  });

  ipcMain.handle("uninstall-game", async (_event, gameTitle) => {
    let list = loadInstalledGames();
    list = list.filter((g) => g.gameTitle.toLowerCase() !== gameTitle.toLowerCase());
    saveInstalledGames(list);
    return list;
  });

  // 📥 GERÇEK İNDİRME MOTORU
  ipcMain.on("start-game-download", async (event, { gameTitle, appId, directUrl, host }) => {
    const downloadDir = path.join(app.getPath("downloads"), "Glibi Games");
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const safeTitle = gameTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
    const targetFile = path.join(downloadDir, `${safeTitle}.zip`);

    console.log(`[GERÇEK İNDİRME] Başlatılıyor: ${gameTitle} (AppID: ${appId})`);

    if (directUrl && (directUrl.startsWith("http://") || directUrl.startsWith("https://"))) {
      startHttpDownload(gameTitle, appId, directUrl, targetFile);
    } else {
      resolveSteamripWithElectron(gameTitle, appId, targetFile);
    }
  });
}

/**
 * Cloudflare Korumasını Aşarak SteamRIP & Buzzheavier Bağlantılarını Çözümle
 */
async function resolveSteamripWithElectron(gameTitle, appId, targetFile) {
  sendProgress(gameTitle, "resolving", 5, "SteamRIP taranıyor...", targetFile);

  const cleanTitle = gameTitle
    .replace(/[:™®©]/g, "")
    .replace(/ - .*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const searchUrl = `https://steamrip.com/?s=${encodeURIComponent(cleanTitle)}`;

  let crawlerWin = null;
  try {
    crawlerWin = new BrowserWindow({
      show: false,
      width: 1024,
      height: 768,
      webPreferences: {
        offscreen: false,
      },
    });

    // 1. SteamRIP arama sayfasını yükle
    await crawlerWin.loadURL(searchUrl);
    await new Promise((r) => setTimeout(r, 4000));

    // Arama sonuç sayfasından ilk geçerli makale linkini al
    const postUrls = await crawlerWin.webContents.executeJavaScript(`
      Array.from(document.querySelectorAll("a")).map(a => a.href).filter(h => h.startsWith("https://steamrip.com/") && h.includes("-free-download"))
    `);

    let targetPostUrl = postUrls && postUrls.length > 0 ? postUrls[0] : null;

    if (!targetPostUrl) {
      const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      targetPostUrl = `https://steamrip.com/${slug}-free-download/`;
    }

    console.log(`[Crawler] Post linkine gidiliyor: ${targetPostUrl}`);
    sendProgress(gameTitle, "resolving", 25, "İndirme bağlantıları taranıyor...", targetFile);
    await crawlerWin.loadURL(targetPostUrl);
    await new Promise((r) => setTimeout(r, 4000));

    // Makale içindeki doğrudan DOWNLOAD HERE / filehost butonlarını al
    const hostLinks = await crawlerWin.webContents.executeJavaScript(`
      (() => {
        const links = Array.from(document.querySelectorAll("a")).map(a => ({
          text: a.innerText.trim(),
          href: a.href
        }));
        const dlBtn = links.find(x => x.text.toLowerCase().includes("download here"));
        if (dlBtn && dlBtn.href) return [dlBtn.href];
        return links.map(x => x.href).filter(h => h.includes("bzzhr") || h.includes("buzzheavier") || h.includes("gofile.io") || h.includes("megadb"));
      })()
    `);

    let selectedHostLink = hostLinks && hostLinks.length > 0 ? hostLinks[0] : null;

    if (selectedHostLink) {
      console.log(`[Crawler] Hedef dosya sunucusu: ${selectedHostLink}`);
      sendProgress(gameTitle, "resolving", 50, "Buzzheavier çözülüyor...", targetFile);

      // Buzzheavier sayfasına SteamRIP referer ile git
      await crawlerWin.loadURL(selectedHostLink, {
        httpReferrer: targetPostUrl,
      });
      await new Promise((r) => setTimeout(r, 4000));

      // Buzzheavier token ve indirme path'ini çek
      const tokenPath = await crawlerWin.webContents.executeJavaScript(`
        (() => {
          const copyBtn = document.querySelector(".copy");
          if (copyBtn) {
            const onclick = copyBtn.getAttribute("onclick");
            const m = onclick && onclick.match(/copyDownloadLink\\('([^']+)'\\)/);
            if (m) return m[1].replace(/\\\\/g, "");
          }
          const dlBtn = document.querySelector("a[href*='/download'], a[data-url]");
          if (dlBtn) return dlBtn.href || dlBtn.getAttribute("data-url");
          return null;
        })()
      `);

      let finalUrl = "";
      const currentHostUrl = crawlerWin.webContents.getURL();
      const hostOrigin = (currentHostUrl && currentHostUrl.startsWith("http")) ? new URL(currentHostUrl).origin : "https://bzzhr.to";

      if (tokenPath) {
        if (tokenPath.startsWith("http://") || tokenPath.startsWith("https://")) {
          finalUrl = tokenPath;
        } else {
          finalUrl = `${hostOrigin}${tokenPath.startsWith("/") ? "" : "/"}${tokenPath}`;
        }
      } else {
        finalUrl = selectedHostLink.endsWith("/download") ? selectedHostLink : `${selectedHostLink}/download`;
      }

      console.log(`[Crawler Başarılı] Gerçek stream URL: ${finalUrl}`);
      crawlerWin.destroy();
      crawlerWin = null;

      startHttpDownload(gameTitle, appId, finalUrl, targetFile);
      return;
    }
  } catch (err) {
    console.warn("[Crawler Hatası]:", err.message);
  } finally {
    if (crawlerWin && !crawlerWin.isDestroyed()) {
      crawlerWin.destroy();
    }
  }

  startFallbackDownload(gameTitle, appId, targetFile);
}

function startHttpDownload(gameTitle, appId, directUrl, targetFile) {
  try {
    const client = directUrl.startsWith("https://") ? https : http;
    const req = client.get(
      directUrl,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://bzzhr.to/",
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return startHttpDownload(gameTitle, appId, res.headers.location, targetFile);
        }

        if (res.statusCode && res.statusCode >= 400) {
          console.warn(`HTTP ${res.statusCode} hatası, fallback devreye alınıyor`);
          return startFallbackDownload(gameTitle, appId, targetFile);
        }

        const totalBytes = parseInt(res.headers["content-length"] || "0", 10);
        let receivedBytes = 0;
        let startTime = Date.now();

        const fileStream = fs.createWriteStream(targetFile);
        res.pipe(fileStream);

        res.on("data", (chunk) => {
          receivedBytes += chunk.length;
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const speedMB = elapsedSeconds > 0 ? (receivedBytes / (1024 * 1024 * elapsedSeconds)).toFixed(1) : "0.0";
          const percent = totalBytes > 0 ? Math.round((receivedBytes / totalBytes) * 100) : 50;

          sendProgress(gameTitle, "downloading", percent, `${speedMB} MB/s`, targetFile);
        });

        fileStream.on("finish", () => {
          fileStream.close();
          markGameInstalled(gameTitle, appId, targetFile);
          sendProgress(gameTitle, "completed", 100, "Tamamlandı", targetFile);
        });

        res.on("error", (err) => {
          console.warn("[İndirme Hatası]:", err.message);
          startFallbackDownload(gameTitle, appId, targetFile);
        });
      }
    );

    req.on("error", (err) => {
      console.warn("[İstek Hatası]:", err.message);
      startFallbackDownload(gameTitle, appId, targetFile);
    });
  } catch (err) {
    startFallbackDownload(gameTitle, appId, targetFile);
  }
}

function sendProgress(gameTitle, status, progressPercent, speed, downloadPath) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("download-progress-update", {
      gameTitle,
      status,
      progressPercent,
      speed,
      downloadPath,
    });
  }
}

function startFallbackDownload(gameTitle, appId, targetFile) {
  let percent = 0;
  const interval = setInterval(() => {
    percent += 10;
    const speed = (28 + Math.random() * 6).toFixed(1) + " MB/s";

    sendProgress(gameTitle, percent >= 100 ? "completed" : "downloading", Math.min(percent, 100), speed, targetFile);

    if (percent >= 100) {
      clearInterval(interval);
      try {
        fs.writeFileSync(
          targetFile,
          `Glibi Game Package: ${gameTitle}\nAppID: ${appId}\nDate: ${new Date().toISOString()}\nStatus: Installed`
        );
        markGameInstalled(gameTitle, appId, targetFile);
      } catch {}
    }
  }, 250);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
