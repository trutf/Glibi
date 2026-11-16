import React, { useState, useRef, useEffect } from "react";
import { GameDetailPage } from "./components/GameDetailPage";
import {
  fetchTopSteamGames,
  searchSteamStore,
  DEFAULT_POPULAR_GAMES,
  CatalogGame,
} from "./services/steamCatalog";

export interface InstalledGame {
  id: string;
  gameTitle: string;
  appId: number;
  downloadPath: string;
  installedAt: string;
}

declare global {
  interface Window {
    electronAPI?: {
      close: () => void;
      minimize: () => void;
      maximize: () => void;
      startDownload: (options: { gameTitle: string; appId?: number; directUrl: string; host: string }) => void;
      onDownloadProgress: (callback: (data: any) => void) => void;
      getInstalledGames: () => Promise<InstalledGame[]>;
      openGameFolder: (folderPath: string) => void;
      uninstallGame: (gameTitle: string) => Promise<InstalledGame[]>;
    };
  }
}

const ITEMS_PER_PAGE = 36; // 4 tam satır x 9 sütun

// Store Featured Categories
const featuredCategories = [
  {
    id: "top-played",
    badge: "EN ÇOK OYNANAN",
    title: "Cyberpunk 2077",
    appId: 1091500,
    sub: "Night City Macerası",
    coverId: "cyberpunk2077",
  },
  {
    id: "new-release",
    badge: "YENİ ÇIKAN",
    title: "Black Myth: Wukong",
    appId: 2358720,
    sub: "Aksiyon RPG",
    coverId: "blackmyth",
  },
  {
    id: "trending",
    badge: "ÖNE ÇIKAN",
    title: "HELLDIVERS™ 2",
    appId: 553850,
    sub: "Galaktik Savaş",
    coverId: "helldivers2",
  },
  {
    id: "dice-random",
    badge: "RASTGELE KEŞİF",
    title: "Euro Truck Simulator 2",
    appId: 227300,
    sub: "Günün Önerisi",
    coverId: "ets2",
  },
];

interface GameCardProps {
  game: CatalogGame;
  onOpenDetail: (appId: number, title: string) => void;
  failedImgs: Record<string, boolean>;
  onImgError: (id: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onOpenDetail, failedImgs, onImgError }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("");
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setGlareStyle({
      opacity: 0.15,
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.45) 0%, transparent 65%)`,
    });

    setTransform(
      `perspective(700px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
    );
  };

  const handleMouseLeave = () => {
    setTransform("perspective(700px) rotateX(0deg) rotateY(0deg)");
    setGlareStyle({ opacity: 0 });
  };

  const steamUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appId}/library_600x900.jpg`;
  const localFallback = `assets/covers/${game.id}.jpg`;
  const imgSrc = failedImgs[game.id] ? localFallback : steamUrl;

  return (
    <div
      ref={cardRef}
      className="game-card"
      onClick={() => onOpenDetail(game.appId, game.title)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="poster-container"
        style={{
          transform: transform || undefined,
        }}
      >
        <img
          src={imgSrc}
          alt={game.title}
          className="poster-img"
          onError={() => onImgError(game.id)}
        />
        <div className="card-glare" style={glareStyle} />
      </div>

      <div className="title-slot">
        <span className="game-title">{game.title}</span>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Store");
  const [storeGames, setStoreGames] = useState<CatalogGame[]>(DEFAULT_POPULAR_GAMES);
  const [failedImgs, setFailedImgs] = useState<Record<string, boolean>>({});
  const [installedGames, setInstalledGames] = useState<InstalledGame[]>([]);

  const refreshInstalledGames = () => {
    if (window.electronAPI?.getInstalledGames) {
      window.electronAPI.getInstalledGames().then((list) => {
        if (Array.isArray(list)) {
          setInstalledGames(list);
        }
      });
    }
  };

  useEffect(() => {
    refreshInstalledGames();
  }, [activeTab]);

  // 📄 Sayfalama (Pagination) Durumu
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 📄 Oyun Detay Sayfası
  const [detailGame, setDetailGame] = useState<{ appId: number; title: string } | null>(null);

  // 🔍 Alt Arama Durumu
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CatalogGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 🎲 Rastgele Zar Önerisi Durumu
  const [randomGame, setRandomGame] = useState<CatalogGame>(DEFAULT_POPULAR_GAMES[12]);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    fetchTopSteamGames().then((games) => {
      if (games && games.length > 0) {
        setStoreGames(games);
      }
    });
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchSteamStore(q).then((results) => {
        setSearchResults(results);
        setIsSearching(false);
        setCurrentPage(1); // Aramada ilk sayfaya dön
      });
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const rollDice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRolling) return;
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * storeGames.length);
      setRandomGame(storeGames[idx]);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 60);
  };

  const handleMinimize = () => {
    window.electronAPI?.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximize();
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  const handleImgError = (gameId: string) => {
    setFailedImgs((prev) => ({ ...prev, [gameId]: true }));
  };

  const handleOpenDetail = (appId: number, title: string) => {
    setDetailGame({ appId, title });
  };

  const handleBackToGallery = () => {
    setDetailGame(null);
  };

  // Aktif liste ve Sayfalama hesabı
  const activeList = searchQuery.trim() ? searchResults : storeGames;
  const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGames = activeList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="launcher-window">
      {/* Top Window Bar */}
      <div className="window-drag-region">
        <div className="topbar-left" />

        {/* Center Navigation Tabs */}
        <div className="topbar-nav">
          {["Library", "Store", "Settings"].map((tab) => (
            <button
              key={tab}
              className={`nav-tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setDetailGame(null);
                setSearchQuery("");
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Window controls */}
        <div className="window-controls">
          <button className="control-btn min" onClick={handleMinimize} title="Küçült">
            <svg width="10" height="1" viewBox="0 0 10 1">
              <rect width="10" height="1" fill="#777" />
            </svg>
          </button>
          <button className="control-btn max" onClick={handleMaximize} title="Büyüt">
            <svg width="9" height="9" viewBox="0 0 9 9">
              <rect x="0.5" y="0.5" width="8" height="8" fill="none" stroke="#777" strokeWidth="1" />
            </svg>
          </button>
          <button className="control-btn close" onClick={handleClose} title="Kapat">
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 1L9 9M9 1L1 9" stroke="#777" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* OYUN DETAY SAYFASI */}
      {detailGame ? (
        <GameDetailPage
          appId={detailGame.appId}
          initialTitle={detailGame.title}
          onBack={handleBackToGallery}
        />
      ) : (
        <>
          {/* Content Area */}
          {activeTab === "Library" && (
            <div className="library-view-container">
              {installedGames.length > 0 ? (
                <div className="games-container store-grid">
                  {installedGames.map((item) => {
                    const catalogMatch = storeGames.find((g) => g.appId === item.appId || g.title.toLowerCase() === item.gameTitle.toLowerCase());
                    const gameObj: CatalogGame = {
                      id: catalogMatch?.id || `installed_${item.appId || item.gameTitle.replace(/\s+/g, '_')}`,
                      appId: item.appId || 0,
                      title: item.gameTitle,
                    };
                    return (
                      <div key={item.id} className="library-card-wrapper">
                        <GameCard
                          game={gameObj}
                          onOpenDetail={handleOpenDetail}
                          failedImgs={failedImgs}
                          onImgError={handleImgError}
                        />
                        <div className="library-card-actions">
                          <button
                            className="lib-action-btn open"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.electronAPI?.openGameFolder(item.downloadPath);
                            }}
                            title="Dosya Konumunu Aç"
                          >
                            Klasör
                          </button>
                          <button
                            className="lib-action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.electronAPI?.uninstallGame) {
                                window.electronAPI.uninstallGame(item.gameTitle).then((updated) => {
                                  setInstalledGames(updated);
                                });
                              }
                            }}
                            title="Kütüphaneden Kaldır"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-library-box">
                  <div className="empty-library-icon">🎮</div>
                  <h3 className="empty-library-title">Kütüphaneniz Henüz Boş</h3>
                  <p className="empty-library-desc">
                    Henüz indirilmiş bir oyununuz bulunmuyor. Mağazaya göz atıp dilediğiniz oyunu tek tıkla indirebilirsiniz.
                  </p>
                  <button
                    className="browse-store-btn"
                    onClick={() => {
                      setActiveTab("Store");
                      setCurrentPage(1);
                    }}
                  >
                    Mağazayı Keşfet
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "Store" && (
            <div className="store-container">
              {/* 4 Parçalı Büyük Kart (Sadece 1. sayfada ve arama yokken) */}
              {!searchQuery.trim() && currentPage === 1 && (
                <div className="showcase-card">
                  {featuredCategories.map((item) => {
                    const isDice = item.id === "dice-random";
                    const currentAppId = isDice ? randomGame.appId : item.appId;
                    const currentTitle = isDice ? randomGame.title : item.title;
                    const currentCoverId = isDice ? randomGame.id : item.coverId;

                    const steamHeaderUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${currentAppId}/header.jpg`;
                    const localHeaderFallback = `assets/covers/${currentCoverId}_header.jpg`;
                    const localVerticalFallback = `assets/covers/${currentCoverId}.jpg`;
                    const imgSrc = failedImgs[`header_${currentCoverId}`]
                      ? (failedImgs[currentCoverId] ? localHeaderFallback : localVerticalFallback)
                      : steamHeaderUrl;

                    return (
                      <div
                        key={item.id}
                        className="showcase-panel"
                        onClick={() => handleOpenDetail(currentAppId, currentTitle)}
                      >
                        <img
                          src={imgSrc}
                          alt={currentTitle}
                          className={`showcase-bg-img ${isDice && isRolling ? "rolling-shuffle" : ""}`}
                          onError={() => handleImgError(`header_${currentCoverId}`)}
                        />
                        <div className="showcase-overlay" />

                        <div className="showcase-content">
                          <div className="showcase-badge-row">
                            <span className="showcase-badge">{item.badge}</span>
                            {isDice && (
                              <button
                                className={`dice-icon-btn ${isRolling ? "active-roll" : ""}`}
                                onClick={rollDice}
                                title="Rastgele Oyun Seç"
                              >
                                <svg className="dice-svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <rect x="3" y="3" width="18" height="18" rx="3.5" stroke="currentColor" strokeWidth="1.8" />
                                  <circle cx="8" cy="8" r="1.4" fill="currentColor" />
                                  <circle cx="16" cy="16" r="1.4" fill="currentColor" />
                                  <circle cx="16" cy="8" r="1.4" fill="currentColor" />
                                  <circle cx="8" cy="16" r="1.4" fill="currentColor" />
                                  <circle cx="12" cy="12" r="1.4" fill="currentColor" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="showcase-info">
                            <h4 className="showcase-title">{currentTitle}</h4>
                            <span className="showcase-sub">{isDice ? "Sana Özel Öneri" : item.sub}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dinamik Steam Oyun Kataloğu Vitrini */}
              <div className="games-container store-grid">
                {paginatedGames.length > 0 ? (
                  paginatedGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onOpenDetail={handleOpenDetail}
                      failedImgs={failedImgs}
                      onImgError={handleImgError}
                    />
                  ))
                ) : (
                  <div className="no-results-msg">
                    {isSearching ? "Steam taranıyor..." : `"${searchQuery}" ile eşleşen oyun bulunamadı`}
                  </div>
                )}
              </div>


            </div>
          )}

          {activeTab === "Settings" && (
            <div className="settings-container">
              <div className="settings-card">
                <h3 className="settings-title">Ayarlar</h3>
                <p className="settings-desc">Launcher ve hesap tercihleri burada yer alacak.</p>
              </div>
            </div>
          )}

          {/* 🌊 Minimalist, Şeffaf & Kompakt Alt Dock (Arama & Sayfalama Tek Satırda) */}
          <div className="bottom-dock-zone">
            <div className="bottom-dock-bar">
              {/* Sol/Orta: Transparan Organik Arama */}
              <div className={`bottom-search-flow ${searchQuery ? "has-query" : ""}`}>
                <svg className="search-lens-icon" width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="bottom-search-input"
                  placeholder={isSearching ? "Steam taranıyor..." : "Oyun ara..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                    ✕
                  </button>
                )}
              </div>

              {/* Sağ: Ultra Kompakt Şeffaf Sayfalama */}
              {activeTab === "Store" && totalPages > 1 && (
                <div className="bottom-pagination-compact">
                  <button
                    className="compact-nav-arrow"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    title="Önceki Sayfa"
                  >
                    ‹
                  </button>
                  <span className="compact-page-indicator">
                    {currentPage} <span className="compact-page-divider">/</span> {totalPages}
                  </span>
                  <button
                    className="compact-nav-arrow"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    title="Sonraki Sayfa"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
