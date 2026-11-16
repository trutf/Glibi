/**
 * Steam Data Service
 * Ücretsiz, API keysiz Steam Store, SteamSpy, UserStats ve AppReviews entegrasyonu.
 * Bellek içi önbellekleme (in-memory cache) içerir.
 */

export interface SteamGameData {
  appId: number;
  name: string;
  type: string;
  shortDescription: string;
  detailedDescription: string;
  developers: string[];
  publishers: string[];
  releaseDate: string;
  isFree: boolean;
  requiredAge: number;

  images: {
    libraryCover: string; // 600x900
    header: string; // 460x215
    background: string;
    backgroundRaw: string;
    screenshots: { id: number; pathThumbnail: string; pathFull: string }[];
  };

  movies: {
    id: number;
    title: string;
    thumbnail: string;
    mp4?: string;
    webm?: string;
  }[];

  features: {
    genres: string[];
    categories: string[];
    tags: string[]; // SteamSpy
    platforms: { windows: boolean; mac: boolean; linux: boolean };
    languages: string;
    controllerSupport?: string;
    achievementCount: number;
    metacriticScore?: number;
    recommendationsCount?: number;
  };

  systemRequirements: {
    pc: { minimum?: string; recommended?: string };
    mac: { minimum?: string; recommended?: string };
    linux: { minimum?: string; recommended?: string };
  };

  stats: {
    currentPlayers: number | null; // Steam Web API
    estimatedOwners: string | null; // SteamSpy (tahmini en yüksek üst limit)
    averagePlaytimeForever: number; // dakika
    averagePlaytime2Weeks: number; // dakika
    positiveReviewsCount: number;
    negativeReviewsCount: number;
    reviewScoreDesc: string;
    totalReviews: number;
  };

  userReviews: {
    id: string;
    authorSteamId: string;
    playtimeHours: number;
    votedUp: boolean;
    reviewText: string;
    createdDate: string;
  }[];
}

const memoryCache = new Map<number, { timestamp: number; data: SteamGameData }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 dakika cache

/**
 * SteamSpy "20,000,000 .. 50,000,000" gibi aralıklar döner.
 * Kullanıcı isteği: En yüksek olanı göstermek (Örn: "50,000,000+").
 */
function parseHighestOwners(ownersStr: string | null | undefined): string | null {
  if (!ownersStr) return null;
  const parts = ownersStr.split("..");
  if (parts.length >= 2) {
    const highStr = parts[1].trim();
    const cleanNum = parseInt(highStr.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(cleanNum)) {
      if (cleanNum >= 1_000_000) {
        return `${(cleanNum / 1_000_000).toFixed(0)}M+`;
      }
      return `${cleanNum.toLocaleString("tr-TR")}+`;
    }
  }
  return ownersStr;
}

export async function fetchSteamGameData(appId: number): Promise<SteamGameData> {
  const cached = memoryCache.get(appId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 4 Farklı Steam API endpoint'ine paralel çağrı yap
  const [storeRes, spyRes, playersRes, reviewsRes] = await Promise.allSettled([
    fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=tr&l=turkish`),
    fetch(`https://steamspy.com/api.php?request=appdetails&appid=${appId}`),
    fetch(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`),
    fetch(`https://store.steampowered.com/appreviews/${appId}?json=1&l=turkish&num_per_page=6`),
  ]);

  let storeJson: any = null;
  let spyJson: any = null;
  let playersJson: any = null;
  let reviewsJson: any = null;

  try {
    if (storeRes.status === "fulfilled" && storeRes.value.ok) {
      storeJson = await storeRes.value.json();
    }
  } catch (e) {
    console.warn("Store API json parse error", e);
  }

  try {
    if (spyRes.status === "fulfilled" && spyRes.value.ok) {
      spyJson = await spyRes.value.json();
    }
  } catch (e) {
    console.warn("SteamSpy parse error", e);
  }

  try {
    if (playersRes.status === "fulfilled" && playersRes.value.ok) {
      playersJson = await playersRes.value.json();
    }
  } catch (e) {
    console.warn("Players API parse error", e);
  }

  try {
    if (reviewsRes.status === "fulfilled" && reviewsRes.value.ok) {
      reviewsJson = await reviewsRes.value.json();
    }
  } catch (e) {
    console.warn("Reviews API parse error", e);
  }

  const appData = storeJson?.[appId]?.data || {};

  // Ekran görüntüleri
  const screenshots = (appData.screenshots || []).map((s: any) => ({
    id: s.id,
    pathThumbnail: s.path_thumbnail || "",
    pathFull: s.path_full || "",
  }));

  // Videolar / Fragmanlar
  const movies = (appData.movies || []).map((m: any) => ({
    id: m.id,
    title: m.name || "",
    thumbnail: m.thumbnail || "",
    mp4: m.mp4?.max || m.mp4?.["480"] || "",
    webm: m.webm?.max || m.webm?.["480"] || "",
  }));

  // SteamSpy Etiketleri
  const tags = spyJson?.tags ? Object.keys(spyJson.tags) : [];

  // Kullanıcı Yorumları
  const rawReviews = reviewsJson?.reviews || [];
  const userReviews = rawReviews.map((r: any) => ({
    id: r.recommendationid || "",
    authorSteamId: r.author?.steamid || "",
    playtimeHours: Math.round(((r.author?.playtime_forever || 0) / 60) * 10) / 10,
    votedUp: Boolean(r.voted_up),
    reviewText: r.review || "",
    createdDate: new Date((r.timestamp_created || 0) * 1000).toLocaleDateString("tr-TR"),
  }));

  const compiled: SteamGameData = {
    appId,
    name: appData.name || spyJson?.name || "Bilinmeyen Oyun",
    type: appData.type || "game",
    shortDescription: appData.short_description || "",
    detailedDescription: appData.detailed_description || "",
    developers: appData.developers || (spyJson?.developer ? [spyJson.developer] : []),
    publishers: appData.publishers || (spyJson?.publisher ? [spyJson.publisher] : []),
    releaseDate: appData.release_date?.date || "Belirtilmedi",
    isFree: Boolean(appData.is_free),
    requiredAge: Number(appData.required_age || 0),

    images: {
      libraryCover: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
      header: appData.header_image || `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
      background: appData.background || "",
      backgroundRaw: appData.background_raw || "",
      screenshots,
    },

    movies,

    features: {
      genres: (appData.genres || []).map((g: any) => g.description),
      categories: (appData.categories || []).map((c: any) => c.description),
      tags,
      platforms: {
        windows: Boolean(appData.platforms?.windows),
        mac: Boolean(appData.platforms?.mac),
        linux: Boolean(appData.platforms?.linux),
      },
      languages: appData.supported_languages || "",
      controllerSupport: appData.controller_support,
      achievementCount: appData.achievements?.total || 0,
      metacriticScore: appData.metacritic?.score,
      recommendationsCount: appData.recommendations?.total,
    },

    systemRequirements: {
      pc: {
        minimum: typeof appData.pc_requirements?.minimum === "string" ? appData.pc_requirements.minimum : undefined,
        recommended: typeof appData.pc_requirements?.recommended === "string" ? appData.pc_requirements.recommended : undefined,
      },
      mac: {
        minimum: typeof appData.mac_requirements?.minimum === "string" ? appData.mac_requirements.minimum : undefined,
        recommended: typeof appData.mac_requirements?.recommended === "string" ? appData.mac_requirements.recommended : undefined,
      },
      linux: {
        minimum: typeof appData.linux_requirements?.minimum === "string" ? appData.linux_requirements.minimum : undefined,
        recommended: typeof appData.linux_requirements?.recommended === "string" ? appData.linux_requirements.recommended : undefined,
      },
    },

    stats: {
      currentPlayers: playersJson?.response?.player_count ?? null,
      estimatedOwners: parseHighestOwners(spyJson?.owners),
      averagePlaytimeForever: spyJson?.average_forever ?? 0,
      averagePlaytime2Weeks: spyJson?.average_2weeks ?? 0,
      positiveReviewsCount: (reviewsJson?.query_summary?.total_positive) ?? spyJson?.positive ?? 0,
      negativeReviewsCount: (reviewsJson?.query_summary?.total_negative) ?? spyJson?.negative ?? 0,
      reviewScoreDesc: reviewsJson?.query_summary?.review_score_desc || "Değerlendirme Yok",
      totalReviews: (reviewsJson?.query_summary?.total_reviews) ?? 0,
    },

    userReviews,
  };

  memoryCache.set(appId, { timestamp: Date.now(), data: compiled });
  return compiled;
}
