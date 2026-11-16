import React, { useEffect, useState } from "react";
import { fetchSteamGameData, SteamGameData } from "../services/steamService";
import {
  searchSteamrip,
  extractSteamripDownloadLinks,
  resolveDirectFileUrl,
  DownloadOption,
} from "../services/steamripDownloader";

interface GameDetailPageProps {
  appId: number;
  initialTitle: string;
  onBack: () => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({
  appId,
  initialTitle,
  onBack,
}) => {
  const [data, setData] = useState<SteamGameData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMedia, setActiveMedia] = useState<{ type: "video" | "image"; url: string } | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);

  // SteamRIP İndirme Durumu
  const [downloadState, setDownloadState] = useState<{
    status: "idle" | "fetching_rip" | "downloading" | "completed" | "error";
    progressPercent: number;
    speed: string;
    hostName: string;
    ripUrl: string;
  }>({
    status: "idle",
    progressPercent: 0,
    speed: "",
    hostName: "",
    ripUrl: "",
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setIsDescExpanded(false);

    // Oyun zaten indirilmiş mi kontrol et
    if (window.electronAPI?.getInstalledGames) {
      window.electronAPI.getInstalledGames().then((list) => {
        if (!isMounted) return;
        const isInstalled = list.some(
          (g) => g.appId === appId || g.gameTitle.toLowerCase() === initialTitle.toLowerCase()
        );
        if (isInstalled) {
          setDownloadState((prev) => ({
            ...prev,
            status: "completed",
            progressPercent: 100,
            speed: "Yüklendi",
          }));
        }
      });
    }

    fetchSteamGameData(appId)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
        if (res.movies && res.movies.length > 0 && res.movies[0].mp4) {
          setActiveMedia({ type: "video", url: res.movies[0].mp4 });
        } else if (res.images.screenshots && res.images.screenshots.length > 0) {
          setActiveMedia({ type: "image", url: res.images.screenshots[0].pathFull });
        } else {
          setActiveMedia({ type: "image", url: res.images.header });
        }
      })
      .catch((err) => {
        console.error("Game data load error", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Electron indirme ilerlemesini dinle
    if (window.electronAPI?.onDownloadProgress) {
      window.electronAPI.onDownloadProgress((prog) => {
        if (!isMounted) return;
        const currentTitle = data?.name || initialTitle;
        if (prog.gameTitle.toLowerCase() === currentTitle.toLowerCase() || (prog.appId && prog.appId === appId)) {
          setDownloadState((prev) => ({
            ...prev,
            status: prog.status,
            progressPercent: prog.progressPercent,
            speed: prog.speed,
          }));
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [appId]);

  // Gerçek Crawler & İndirici: SteamRIP -> Filehost Link Çözümleme -> Electron Stream
  const handleStartAutoDownload = () => {
    const gameName = data?.name || initialTitle;
    setDownloadState({
      status: "fetching_rip",
      progressPercent: 5,
      speed: "SteamRIP taranıyor...",
      hostName: "SteamRIP",
      ripUrl: "",
    });

    // Doğrudan Electron arka plan crawler ve resolver'ına devret
    window.electronAPI?.startDownload({
      gameTitle: gameName,
      appId: appId,
      directUrl: "",
      host: "SteamRIP",
    });
  };

  return (
    <div className="game-detail-viewport">
      {/* Detail Top Navigation Bar */}
      <div className="detail-top-nav">
        <button className="back-btn" onClick={onBack} title="Geri Dön">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="back-btn-text">Geri</span>
        </button>

        <span className="detail-header-title">{data?.name || initialTitle}</span>
        <div style={{ width: 70 }} />
      </div>

      <div className="detail-scroll-content">
        {/* Üst Başlık & Saf Tipografi Bilgileri */}
        <div className="detail-header-pure">
          <div className="detail-pure-left">
            <div className="detail-poster-box">
              <img
                src={data?.images.libraryCover || `assets/covers/${appId}.jpg`}
                alt={data?.name || initialTitle}
                className="detail-poster-img"
              />
            </div>
          </div>

          <div className="detail-pure-right">
            <div className="detail-title-action-row">
              <h1 className="detail-game-h1">{data?.name || initialTitle}</h1>

              {/* ⚡ Tek Tıkla Yükle / SteamRIP Otomatik İndir Butonu */}
              <div className="download-action-group">
                {downloadState.status === "idle" && (
                  <button className="pure-install-btn" onClick={handleStartAutoDownload}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3V16M12 16L7 11M12 16L17 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 19H21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    <span>Yükle</span>
                  </button>
                )}

                {downloadState.status === "fetching_rip" && (
                  <div className="download-resolving-badge">
                    <span className="spinner-dot" />
                    <span>SteamRIP Çözülüyor...</span>
                  </div>
                )}

                {downloadState.status === "downloading" && (
                  <div className="download-active-panel">
                    <div className="download-progress-track">
                      <div
                        className="download-progress-bar"
                        style={{ width: `${downloadState.progressPercent}%` }}
                      />
                    </div>
                    <div className="download-meta-text">
                      <span>%{downloadState.progressPercent} ({downloadState.hostName})</span>
                      <span className="download-speed-num">{downloadState.speed}</span>
                    </div>
                  </div>
                )}

                {downloadState.status === "completed" && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="pure-install-btn installed"
                      onClick={() => window.electronAPI?.openGameFolder("")}
                      title="İndirilen Dosyayı Aç"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Yüklendi (Klasörü Aç)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-genres-row">
              {data?.features.genres.slice(0, 3).map((g) => (
                <span key={g} className="detail-genre-pill">
                  {g}
                </span>
              ))}
              {data?.isFree && <span className="detail-free-pill">Ücretsiz</span>}
            </div>

            <p className="detail-short-desc">
              {data?.shortDescription || "Oyun detayları yükleniyor..."}
            </p>

            {/* Sadeleştirilmiş, Göz Yormayan Temiz İstatistik Sırası */}
            <div className="detail-pure-stats-row">
              <div className="pure-stat-item">
                <span className="pure-stat-label">Anlık</span>
                <span className="pure-stat-value">
                  {data?.stats.currentPlayers !== null ? data?.stats.currentPlayers.toLocaleString("tr-TR") : "—"}
                </span>
              </div>

              <div className="pure-stat-item">
                <span className="pure-stat-label">Tahmini Sahip</span>
                <span className="pure-stat-value">{data?.stats.estimatedOwners || "—"}</span>
              </div>

              <div className="pure-stat-item">
                <span className="pure-stat-label">Değerlendirme</span>
                <span className="pure-stat-value">
                  {data?.stats.reviewScoreDesc || "—"}
                </span>
              </div>

              <div className="pure-stat-item">
                <span className="pure-stat-label">Geliştirici</span>
                <span className="pure-stat-value">{data?.developers[0] || "—"}</span>
              </div>

              <div className="pure-stat-item">
                <span className="pure-stat-label">Çıkış</span>
                <span className="pure-stat-value">{data?.releaseDate || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medya Bölümü */}
        {data && (data.movies.length > 0 || data.images.screenshots.length > 0) && (
          <div className="detail-media-section">
            <div className="media-stage">
              {activeMedia?.type === "video" ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  muted
                  className="stage-video"
                />
              ) : (
                <img
                  src={activeMedia?.url}
                  alt=""
                  className="stage-image"
                />
              )}
            </div>

            {/* Yatay Akıcı Medya Şeridi */}
            <div className="media-thumbs-row">
              {data.movies.map((m) => (
                <div
                  key={m.id}
                  className={`media-thumb-item ${activeMedia?.url === m.mp4 ? "active" : ""}`}
                  onClick={() => m.mp4 && setActiveMedia({ type: "video", url: m.mp4 })}
                >
                  <img src={m.thumbnail} alt={m.title} className="thumb-img" />
                  <div className="play-badge">▶</div>
                </div>
              ))}

              {data.images.screenshots.map((s) => (
                <div
                  key={s.id}
                  className={`media-thumb-item ${activeMedia?.url === s.pathFull ? "active" : ""}`}
                  onClick={() => setActiveMedia({ type: "image", url: s.pathFull })}
                >
                  <img src={s.pathThumbnail} alt="" className="thumb-img" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detay Gövdesi */}
        <div className="detail-pure-body">
          {/* Oyun Hakkında: Tıklayınca Açılan Derli Toplu Kart */}
          <div className="expandable-desc-card">
            <div className="expandable-header" onClick={() => setIsDescExpanded(!isDescExpanded)}>
              <span className="pure-section-title" style={{ margin: 0 }}>Oyun Hakkında</span>
              <button className="expand-toggle-btn">
                <span>{isDescExpanded ? "Daralt" : "Devamını Oku"}</span>
                <svg
                  className={`arrow-icon ${isDescExpanded ? "open" : ""}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className={`expandable-content ${isDescExpanded ? "expanded" : "collapsed"}`}>
              <div
                className="detailed-desc-html"
                dangerouslySetInnerHTML={{
                  __html: data?.detailedDescription || "<p>Açıklama bulunamadı.</p>",
                }}
              />
              {!isDescExpanded && <div className="expandable-fade-mask" />}
            </div>
          </div>

          {/* Sistem Gereksinimleri */}
          {(data?.systemRequirements.pc.minimum || data?.systemRequirements.pc.recommended) && (
            <div className="detail-pure-sysreq-section">
              <h3 className="pure-section-title">Sistem Gereksinimleri</h3>
              <div className="sys-req-grid">
                {data?.systemRequirements.pc.minimum && (
                  <div
                    className="sys-req-block"
                    dangerouslySetInnerHTML={{ __html: data.systemRequirements.pc.minimum }}
                  />
                )}
                {data?.systemRequirements.pc.recommended && (
                  <div
                    className="sys-req-block"
                    dangerouslySetInnerHTML={{ __html: data.systemRequirements.pc.recommended }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Topluluk Etiketleri */}
          {data?.features.tags && data.features.tags.length > 0 && (
            <div className="detail-pure-tags-section">
              <h3 className="pure-section-title">Etiketler</h3>
              <div className="tags-cloud">
                {data.features.tags.slice(0, 14).map((t) => (
                  <span key={t} className="community-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gerçek Oyuncu Yorumları */}
          {data && data.userReviews.length > 0 && (
            <div className="detail-pure-reviews-section">
              <h3 className="pure-section-title">Oyuncu Yorumları</h3>
              <div className="user-reviews-grid">
                {data.userReviews.slice(0, 4).map((r) => (
                  <div key={r.id} className="pure-review-card">
                    <div className="review-meta-line">
                      <span className={`review-thumb-icon ${r.votedUp ? "up" : "down"}`}>
                        {r.votedUp ? "👍 Tavsiye Ediliyor" : "👎 Tavsiye Edilmiyor"}
                      </span>
                      <span className="review-hours">{r.playtimeHours} saat</span>
                    </div>
                    <p className="review-snippet">{r.reviewText}</p>
                    <span className="review-date">{r.createdDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
