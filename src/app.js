// Glibi Launcher Renderer Logic
document.addEventListener("DOMContentLoaded", () => {
  console.log("Glibi Game Launcher loaded.");

  // Window control buttons (Minimize, Maximize, Close)
  const closeBtn = document.querySelector(".win-btn.close");
  const minBtn = document.querySelector(".win-btn.minimize");
  const maxBtn = document.querySelector(".win-btn.maximize");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.electronAPI?.close();
    });
  }

  if (minBtn) {
    minBtn.addEventListener("click", () => {
      window.electronAPI?.minimize();
    });
  }

  if (maxBtn) {
    maxBtn.addEventListener("click", () => {
      window.electronAPI?.maximize();
    });
  }

  // Sidebar navigation switching
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // Game card selection
  const cards = document.querySelectorAll(".game-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.querySelector(".card-title")?.textContent;
      console.log(`Seçilen oyun: ${title}`);
    });
  });
});
