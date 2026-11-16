// Electrobun 2.x config without stale npm import
export default {
  app: {
    name: "Glibi Launcher",
    identifier: "com.glibi.launcher",
    version: "0.1.0",
  },
  build: {
    views: {
      main: {
        entrypoint: "src/index.html",
      },
    },
  },
  window: {
    title: "Glibi Game Launcher",
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: true,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#1c1c1c",
  },
};
