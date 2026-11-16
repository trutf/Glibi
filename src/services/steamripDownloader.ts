// Doğrulanmış SteamRIP slug ve doğrudan arama tablosu
const STEAMRIP_SLUG_MAP: Record<string, string> = {
  "terraria": "https://steamrip.com/terraria-free-download-1s/",
  "counter-strike 2": "https://steamrip.com/counter-strike-2-free-download/",
  "cs2": "https://steamrip.com/counter-strike-2-free-download/",
  "half-life": "https://steamrip.com/half-life-free-download/",
  "half-life 2": "https://steamrip.com/half-life-2-free-download/",
  "portal 2": "https://steamrip.com/portal-2-free-download/",
  "left 4 dead 2": "https://steamrip.com/left-4-dead-2-free-download/",
  "garry's mod": "https://steamrip.com/garrys-mod-free-download/",
  "euro truck simulator 2": "https://steamrip.com/euro-truck-simulator-2-free-download/",
  "black myth: wukong": "https://steamrip.com/black-myth-wukong-free-download/",
  "helldivers 2": "https://steamrip.com/helldivers-2-free-download/",
  "baldurs gate 3": "https://steamrip.com/baldurs-gate-3-free-download/",
  "cyberpunk 2077": "https://steamrip.com/cyberpunk-2077-free-download/",
  "the witcher 3: wild hunt": "https://steamrip.com/the-witcher-3-wild-hunt-free-download/",
  "elden ring": "https://steamrip.com/elden-ring-free-download/",
  "stardew valley": "https://steamrip.com/stardew-valley-free-download/",
  "rust": "https://steamrip.com/rust-free-download/",
  "palworld": "https://steamrip.com/palworld-free-download/",
};
/**
 * SteamRIP & Filehost Resolver Engine
 * - SteamRIP WordPress Rest API & search scraping
 * - Direct Buzzheavier / GoFile / MegaDB / 1Fichier extraction
 * - Real Buzzheavier file download link resolution
 */

export interface DownloadOption {
  hostName: "Buzzheavier" | "GoFile" | "1Fichier" | "MegaDB" | "Torrent" | "Direct";
  url: string;
  isDirectDownloadable: boolean;
}

export interface SteamripGameResult {
  title: string;
  steamripUrl: string;
  downloadLinks: DownloadOption[];
}

export interface DownloadProgress {
  status: "idle" | "resolving" | "downloading" | "completed" | "error";
  progressPercent: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: string;
  errorMessage?: string;
  resolvedDirectUrl?: string;
}

/**
 * 1. SteamRIP Arama Çözücü
 * Hem WordPress REST API (/wp-json/wp/v2/posts) hem de standart arama query'si (/ ?s=) ile
 * oyunun gerçek SteamRIP makale sayfasını bulur.
 */
export async function searchSteamrip(gameTitle: string): Promise<string | null> {
  const cleanLower = gameTitle.toLowerCase().trim();
  for (const [key, url] of Object.entries(STEAMRIP_SLUG_MAP)) {
    if (cleanLower.includes(key) || key.includes(cleanLower)) {
      console.log(`[SteamRIP Map] Eşleşen doğrulanan link: ${url}`);
      return url;
    }
  }

  const cleanTitle = gameTitle
    .replace(/[:™®©]/g, "")
    .replace(/ - .*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  // Yöntem 1: WordPress REST API ile doğrudan post arama
  try {
    const apiUrl = `https://steamrip.com/wp-json/wp/v2/posts?search=${encodeURIComponent(
      cleanTitle
    )}&per_page=5`;
    const apiRes = await fetch(apiUrl, {
      headers: { "User-Agent": userAgent, Accept: "application/json" },
    });

    if (apiRes.ok) {
      const posts = await apiRes.json();
      if (Array.isArray(posts) && posts.length > 0) {
        // En iyi eşleşen postu bul
        const post = posts[0];
        if (post && post.link) {
          console.log(`[SteamRIP API] Oyun bulundu: ${post.title?.rendered} -> ${post.link}`);
          return post.link;
        }
      }
    }
  } catch (err) {
    // API başarısız olursa HTML scraping'e geç
  }

  // Yöntem 2: HTML Search Form scraping
  try {
    const searchUrl = `https://steamrip.com/?s=${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": userAgent },
    });

    if (res.ok) {
      const html = await res.text();
      // class="all-posts", class="post-title" veya <article> içindeki linkleri çek
      const matches = [
        ...html.matchAll(/<h2[^>]*class="[^"]*post-title[^"]*"[^>]*><a\s+href="([^"]+)"/gi),
        ...html.matchAll(/<a\s+class="[^"]*post-thumbnail-link[^"]*"\s+href="([^"]+)"/gi),
        ...html.matchAll(/href="(https:\/\/steamrip\.com\/[a-z0-9-]+-free-download\/)"/gi),
      ];

      for (const m of matches) {
        if (m[1] && !m[1].includes("/page/")) {
          console.log(`[SteamRIP Scraper] HTML'den bulundu: ${m[1]}`);
          return m[1];
        }
      }
    }
  } catch (err) {
    console.warn("[SteamRIP Scraper Error]:", err);
  }

  // Yöntem 3: Doğrudan URL Slug Tahmini
  const slug = cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `https://steamrip.com/${slug}-free-download/`;
}

/**
 * 2. SteamRIP Oyun Sayfasından Gerçek Filehost Linklerini Ayıklayıcı (Scraper)
 */
export async function extractSteamripDownloadLinks(steamripUrl: string): Promise<DownloadOption[]> {
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  try {
    const res = await fetch(steamripUrl, {
      headers: { "User-Agent": userAgent },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const links: DownloadOption[] = [];

    // Buzzheavier / bzzhr
    const buzzMatches = [
      ...html.matchAll(/href="([^"]*(?:buzzheavier\.com|bzzhr)[^"]*)"/gi),
    ];
    for (const m of buzzMatches) {
      const url = m[1];
      if (!links.some((l) => l.url === url)) {
        links.push({
          hostName: "Buzzheavier",
          url,
          isDirectDownloadable: true,
        });
      }
    }

    // GoFile
    const gofileMatches = [...html.matchAll(/href="([^"]*gofile\.io\/d\/[^"]*)"/gi)];
    for (const m of gofileMatches) {
      const url = m[1];
      if (!links.some((l) => l.url === url)) {
        links.push({
          hostName: "GoFile",
          url,
          isDirectDownloadable: true,
        });
      }
    }

    // MegaDB / 1Fichier / Torrent
    const megaMatches = [...html.matchAll(/href="([^"]*megadb\.net[^"]*)"/gi)];
    for (const m of megaMatches) {
      const url = m[1];
      if (!links.some((l) => l.url === url)) {
        links.push({
          hostName: "MegaDB",
          url,
          isDirectDownloadable: false,
        });
      }
    }

    const torrentMatches = [...html.matchAll(/href="([^"]*\.torrent[^"]*)"/gi)];
    for (const m of torrentMatches) {
      const url = m[1];
      if (!links.some((l) => l.url === url)) {
        links.push({
          hostName: "Torrent",
          url,
          isDirectDownloadable: true,
        });
      }
    }

    if (links.length > 0) {
      return links;
    }
  } catch (err) {
    console.warn(`[SteamRIP Extract Warning]: ${steamripUrl}`, err);
  }

  return [];
}

/**
 * 3. Buzzheavier (bzzhr) / Filehost Doğrudan Dosya İndirme URL Çözücüsü
 * Buzzheavier sayfasındaki gerçek dosya CDN / download stream adresini ayıklar.
 */
export async function resolveDirectFileUrl(downloadOption: DownloadOption): Promise<string> {
  const { hostName, url } = downloadOption;

  if (hostName === "Buzzheavier") {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        redirect: "follow",
      });
      const html = await res.text();

      // Buzzheavier doğrudan dosya indirme düğmesi veya backend API yönlendirmesi
      const directMatches = [
        html.match(/href="([^"]+\/(?:download|get|stream)\/[^"]+)"/i),
        html.match(/data-url="([^"]+)"/i),
        html.match(/href="(https:\/\/[^"]+\.(?:zip|rar|7z|iso|exe))"/i),
        html.match(/window\.location\s*=\s*['"]([^'"]+)['"]/i),
      ];

      for (const m of directMatches) {
        if (m && m[1]) {
          return m[1];
        }
      }

      // Buzzheavier'da /download endpoint'i yoksa dosya id'si üzerinden /download ekle
      if (!url.endsWith("/download") && !url.includes("?")) {
        return `${url}/download`;
      }
    } catch {
      return url;
    }
  }

  return url;
}
