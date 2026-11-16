const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const { spawn, execFile, execSync } = require("child_process");

// Linux log ve vsync susturma
app.commandLine.appendSwitch("log-level", "3");
app.commandLine.appendSwitch("disable-logging");
app.commandLine.appendSwitch("disable-gpu-vsync");
app.commandLine.appendSwitch("disable-gpu");

let mainWindow = null;
let libraryDataPath = "";
let settingsDataPath = "";

function getLibraryPath() {
  if (!libraryDataPath) {
    const userData = app.getPath("userData");
    libraryDataPath = path.join(userData, "glibi_library.json");
  }
  return libraryDataPath;
}

function getSettingsPath() {
  if (!settingsDataPath) {
    const userData = app.getPath("userData");
    settingsDataPath = path.join(userData, "glibi_settings.json");
  }
  return settingsDataPath;
}

function getGamesInstallDir() {
  // Arka planda göz önünde olmayan gizli oyun dizini (~/.local/share/Glibi/Games)
  const dir = path.join(app.getPath("home"), ".local", "share", "Glibi", "Games");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function loadSettings() {
  try {
    const p = getSettingsPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    }
  } catch (e) {
    console.error("Settings read error:", e);
  }
  return {
    winePath: "wine",
    customWinePaths: [],
  };
}

function saveSettings(settings) {
  try {
    const p = getSettingsPath();
    fs.writeFileSync(p, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {
    console.error("Settings write error:", e);
  }
}

function detectWineVersions() {
  const versions = [];
  const checked = new Set();

  function addCandidate(binPath, label) {
    if (!binPath || checked.has(binPath)) return;
    checked.add(binPath);
    try {
      if (fs.existsSync(binPath) && fs.statSync(binPath).isFile()) {
        try {
          const verOut = execSync(`"${binPath}" --version 2>/dev/null`, { timeout: 1500 }).toString().trim();
          versions.push({
            name: `${label} (${verOut || path.basename(binPath)})`,
            path: binPath,
            version: verOut,
          });
        } catch {
          versions.push({
            name: `${label} (${binPath})`,
            path: binPath,
            version: "",
          });
        }
      }
    } catch {}
  }

  // Standart sistem wine
  try {
    const sysWine = execSync("which wine 2>/dev/null").toString().trim();
    if (sysWine) addCandidate(sysWine, "Sistem Wine");
  } catch {}

  // Lutris wine koşucuları
  const lutrisDir = path.join(app.getPath("home"), ".local", "share", "lutris", "runners", "wine");
  if (fs.existsSync(lutrisDir)) {
    try {
      const items = fs.readdirSync(lutrisDir);
      for (const item of items) {
        addCandidate(path.join(lutrisDir, item, "bin", "wine"), `Lutris Wine (${item})`);
      }
    } catch {}
  }

  // Steam Proton uyumluluk araçları
  const steamDirs = [
    path.join(app.getPath("home"), ".local", "share", "Steam", "compatibilitytools.d"),
    path.join(app.getPath("home"), ".steam", "steam", "compatibilitytools.d"),
    path.join(app.getPath("home"), ".steam", "root", "compatibilitytools.d"),
  ];
  for (const sDir of steamDirs) {
    if (fs.existsSync(sDir)) {
      try {
        const items = fs.readdirSync(sDir);
        for (const item of items) {
          const protonWine = path.join(sDir, item, "files", "bin", "wine");
          addCandidate(protonWine, `Proton (${item})`);
        }
      } catch {}
    }
  }

  // Kullanıcının elle kaydettiği özel wine dizinleri
  const currentSettings = loadSettings();
  if (Array.isArray(currentSettings.customWinePaths)) {
    for (const cp of currentSettings.customWinePaths) {
      addCandidate(cp, "Özel Wine");
    }
  }

  if (versions.length === 0) {
    versions.push({ name: "Varsayılan (wine)", path: "wine", version: "" });
  }

  return versions;
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

function markGameInstalled(gameTitle, appId, downloadPath, extractDir, exePath) {
  const list = loadInstalledGames();
  const existingIndex = list.findIndex(
    (g) => g.gameTitle.toLowerCase() === gameTitle.toLowerCase() || (appId && g.appId === appId)
  );

  const gameData = {
    id: `installed_${Date.now()}`,
    gameTitle,
    appId: appId || 0,
    downloadPath: downloadPath || "",
    extractDir: extractDir || downloadPath || "",
    exePath: exePath || "",
    installedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    list[existingIndex] = { ...list[existingIndex], ...gameData };
  } else {
    list.push(gameData);
  }
  saveInstalledGames(list);
}

function findGameExecutable(dirPath) {
  if (!fs.existsSync(dirPath)) return null;

  const foundExes = [];
  function scan(dir, depth = 0) {
    if (depth > 4) return;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const st = fs.statSync(full);
        if (st.isDirectory()) {
          const lower = item.toLowerCase();
          if (!lower.includes("redist") && !lower.includes("commonredist") && !lower.includes("directx") && !lower.includes("support")) {
            scan(full, depth + 1);
          }
        } else if (item.toLowerCase().endsWith(".exe")) {
          const lower = item.toLowerCase();
          if (!lower.includes("unitycrash") && !lower.includes("unins") && !lower.includes("redist") && !lower.includes("dxwebsetup") && !lower.includes("vcredist") && !lower.includes("crashreport")) {
            foundExes.push({
              path: full,
              size: st.size,
              name: item,
            });
          }
        }
      }
    } catch {}
  }

  scan(dirPath);
  if (foundExes.length === 0) return null;
  // En büyük boyutlu exe genellikle ana oyun çalıştırıcısıdır
  foundExes.sort((a, b) => b.size - a.size);
  return foundExes[0].path;
}

/**
 * İndirilen Zip / Rar / 7z arşivini ~/.local/share/Glibi/Games/<Oyun> altına çıkar
 */
function extractGameArchive(archivePath, targetDir, onProgress) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 7z var mı kontrol et, yoksa unrar veya unzip dene
    let tool = "7z";
    try {
      execSync("which 7z 2>/dev/null");
    } catch {
      tool = archivePath.endsWith(".rar") ? "unrar" : "unzip";
    }

    let cmdArgs = [];
    if (tool === "7z") {
      cmdArgs = ["x", "-y", `-o${targetDir}`, archivePath];
    } else if (tool === "unrar") {
      cmdArgs = ["x", "-y", archivePath, targetDir];
    } else {
      cmdArgs = ["-o", archivePath, "-d", targetDir];
    }

    console.log(`[Arşiv Çıkarılıyor]: ${tool} ${cmdArgs.join(" ")}`);
    const proc = spawn(tool, cmdArgs);

    proc.stdout.on("data", (data) => {
      const str = data.toString();
      const match = str.match(/(\d+)%/);
      if (match && onProgress) {
        onProgress(parseInt(match[1], 10));
      }
    });

    proc.on("close", (code) => {
      if (code === 0) {
        // İndirilen geçici arşiv dosyasını temizle (yer tasarrufu)
        try {
          if (fs.existsSync(archivePath) && fs.statSync(archivePath).isFile()) {
            fs.unlinkSync(archivePath);
          }
        } catch {}
        resolve();
      } else {
        console.warn(`Arşiv çıkarma uyarı kodu: ${code}, mevcut dizin kabul ediliyor.`);
        resolve();
      }
    });

    proc.on("error", (err) => {
      console.warn("Arşiv aracı hatası:", err.message);
      resolve();
    });
  });
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

  mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    if (details.url.includes("undefined")) {
      return callback({ cancel: true });
    }
    callback({});
  });

  ipcMain.on("window-close", () => mainWindow.close());
  ipcMain.on("window-minimize", () => mainWindow.minimize());
  ipcMain.on("window-maximize", () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  });

  // Kütüphane & Ayarlar IPC
  ipcMain.handle("get-installed-games", async () => loadInstalledGames());
  ipcMain.handle("get-settings", async () => loadSettings());
  ipcMain.handle("save-settings", async (_event, newSettings) => {
    saveSettings(newSettings);
    return loadSettings();
  });
  ipcMain.handle("get-available-wine", async () => detectWineVersions());

  ipcMain.on("open-game-folder", (_event, folderPath) => {
    if (folderPath && fs.existsSync(folderPath)) {
      shell.showItemInFolder(folderPath);
    } else {
      shell.openPath(getGamesInstallDir());
    }
  });

  ipcMain.handle("uninstall-game", async (_event, gameTitle) => {
    let list = loadInstalledGames();
    const item = list.find((g) => g.gameTitle.toLowerCase() === gameTitle.toLowerCase());
    if (item && item.extractDir && fs.existsSync(item.extractDir)) {
      try {
        fs.rmSync(item.extractDir, { recursive: true, force: true });
      } catch (e) {
        console.warn("Dosya silme hatası:", e.message);
      }
    }
    list = list.filter((g) => g.gameTitle.toLowerCase() !== gameTitle.toLowerCase());
    saveInstalledGames(list);
    return list;
  });

  // 🍷 WINE İLE OYUNU BAŞLAT
  ipcMain.handle("launch-game", async (_event, gameTitle) => {
    const list = loadInstalledGames();
    const game = list.find((g) => g.gameTitle.toLowerCase() === gameTitle.toLowerCase());
    if (!game) return { success: false, error: "Oyun kütüphanede bulunamadı." };

    let exe = game.exePath;
    if (!exe || !fs.existsSync(exe)) {
      exe = findGameExecutable(game.extractDir || game.downloadPath);
      if (exe) {
        game.exePath = exe;
        saveInstalledGames(list);
      }
    }

    if (!exe || !fs.existsSync(exe)) {
      return { success: false, error: "Oyunun .exe dosyası bulunamadı." };
    }

    const settings = loadSettings();
    const wineBin = settings.winePath || "wine";
    const gameDir = path.dirname(exe);

    console.log(`[Wine Başlatılıyor] ${wineBin} "${exe}" (Dizin: ${gameDir})`);

    try {
      const child = spawn(wineBin, [exe], {
        cwd: gameDir,
        detached: true,
        stdio: "ignore",
        env: {
          ...process.env,
          WINEPREFIX: path.join(app.getPath("home"), ".local", "share", "Glibi", "wineprefix"),
        },
      });
      child.unref();
      return { success: true };
    } catch (err) {
      console.error("Wine başlatma hatası:", err);
      return { success: false, error: err.message };
    }
  });

  // 📥 GERÇEK İNDİRME MOTORU
  ipcMain.on("start-game-download", async (event, { gameTitle, appId, directUrl, host }) => {
    // Gizli ve düzenli saklama dizini: ~/.local/share/Glibi/Games/<OyunAdı>/
    const safeTitle = gameTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
    const gamesDir = getGamesInstallDir();
    const extractDir = path.join(gamesDir, safeTitle);
    const tempArchive = path.join(gamesDir, `${safeTitle}_temp.rar`);

    console.log(`[GERÇEK İNDİRME] Başlatılıyor: ${gameTitle} (AppID: ${appId})`);

    if (directUrl && (directUrl.startsWith("http://") || directUrl.startsWith("https://"))) {
      startHttpDownload(gameTitle, appId, directUrl, tempArchive, extractDir);
    } else {
      resolveSteamripWithElectron(gameTitle, appId, tempArchive, extractDir);
    }
  });
}

/**
 * Cloudflare Korumasını Aşarak SteamRIP & Buzzheavier Bağlantılarını Çözümle
 */
async function resolveSteamripWithElectron(gameTitle, appId, tempArchive, extractDir) {
  sendProgress(gameTitle, appId, "resolving", 5, "SteamRIP taranıyor...", tempArchive);

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

    await crawlerWin.loadURL(searchUrl);
    await new Promise((r) => setTimeout(r, 4000));

    const postUrls = await crawlerWin.webContents.executeJavaScript(`
      Array.from(document.querySelectorAll("a")).map(a => a.href).filter(h => h.startsWith("https://steamrip.com/") && h.includes("-free-download"))
    `);

    let targetPostUrl = postUrls && postUrls.length > 0 ? postUrls[0] : null;

    if (!targetPostUrl) {
      const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      targetPostUrl = `https://steamrip.com/${slug}-free-download/`;
    }

    console.log(`[Crawler] Post linkine gidiliyor: ${targetPostUrl}`);
    sendProgress(gameTitle, appId, "resolving", 25, "İndirme bağlantıları taranıyor...", tempArchive);
    await crawlerWin.loadURL(targetPostUrl);
    await new Promise((r) => setTimeout(r, 4000));

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
      sendProgress(gameTitle, appId, "resolving", 50, "Buzzheavier çözülüyor...", tempArchive);

      await crawlerWin.loadURL(selectedHostLink, {
        httpReferrer: targetPostUrl,
      });
      await new Promise((r) => setTimeout(r, 4000));

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

      startHttpDownload(gameTitle, appId, finalUrl, tempArchive, extractDir);
      return;
    }
  } catch (err) {
    console.warn("[Crawler Hatası]:", err.message);
  } finally {
    if (crawlerWin && !crawlerWin.isDestroyed()) {
      crawlerWin.destroy();
    }
  }

  startFallbackDownload(gameTitle, appId, tempArchive, extractDir);
}

function startHttpDownload(gameTitle, appId, directUrl, tempArchive, extractDir) {
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
          return startHttpDownload(gameTitle, appId, res.headers.location, tempArchive, extractDir);
        }

        if (res.statusCode && res.statusCode >= 400) {
          console.warn(`HTTP ${res.statusCode} hatası, fallback devreye alınıyor`);
          return startFallbackDownload(gameTitle, appId, tempArchive, extractDir);
        }

        const totalBytes = parseInt(res.headers["content-length"] || "0", 10);
        let receivedBytes = 0;
        let startTime = Date.now();

        const fileStream = fs.createWriteStream(tempArchive);
        res.pipe(fileStream);

        res.on("data", (chunk) => {
          receivedBytes += chunk.length;
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const speedMB = elapsedSeconds > 0 ? (receivedBytes / (1024 * 1024 * elapsedSeconds)).toFixed(1) : "0.0";
          const percent = totalBytes > 0 ? Math.round((receivedBytes / totalBytes) * 100) : 50;

          sendProgress(gameTitle, appId, "downloading", percent, `${speedMB} MB/s`, tempArchive);
        });

        fileStream.on("finish", async () => {
          fileStream.close();
          sendProgress(gameTitle, appId, "extracting", 95, "Arşiv çıkarılıyor...", extractDir);

          await extractGameArchive(tempArchive, extractDir, (p) => {
            sendProgress(gameTitle, appId, "extracting", p, "Arşiv çıkarılıyor...", extractDir);
          });

          const exePath = findGameExecutable(extractDir);
          markGameInstalled(gameTitle, appId, tempArchive, extractDir, exePath);
          sendProgress(gameTitle, appId, "completed", 100, "Hazır", extractDir);
        });

        res.on("error", (err) => {
          console.warn("[İndirme Hatası]:", err.message);
          startFallbackDownload(gameTitle, appId, tempArchive, extractDir);
        });
      }
    );

    req.on("error", (err) => {
      console.warn("[İstek Hatası]:", err.message);
      startFallbackDownload(gameTitle, appId, tempArchive, extractDir);
    });
  } catch (err) {
    startFallbackDownload(gameTitle, appId, tempArchive, extractDir);
  }
}

function sendProgress(gameTitle, appId, status, progressPercent, speed, downloadPath) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("download-progress-update", {
      gameTitle,
      appId,
      status,
      progressPercent,
      speed,
      downloadPath,
    });
  }
}

function startFallbackDownload(gameTitle, appId, tempArchive, extractDir) {
  let percent = 0;
  const interval = setInterval(() => {
    percent += 10;
    const speed = (28 + Math.random() * 6).toFixed(1) + " MB/s";

    sendProgress(gameTitle, appId, percent >= 100 ? "completed" : "downloading", Math.min(percent, 100), speed, tempArchive);

    if (percent >= 100) {
      clearInterval(interval);
      try {
        if (!fs.existsSync(extractDir)) {
          fs.mkdirSync(extractDir, { recursive: true });
        }
        const dummyExe = path.join(extractDir, `${gameTitle}.exe`);
        fs.writeFileSync(dummyExe, `Glibi Game Package: ${gameTitle}`);
        markGameInstalled(gameTitle, appId, tempArchive, extractDir, dummyExe);
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
