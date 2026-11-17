import steamripData from "../data/steamrip_catalog.json";
import directCoversMap from "../data/app_direct_covers.json";

export interface CatalogGame {
  id: string;
  appId: number;
  title: string;
  ripUrl?: string;
  hasCover?: boolean;
}

// 1. Oyunları resimliler (önce) ve resimsizler (en arkada) olarak iki gruba ayır
const withCovers: CatalogGame[] = [];
const withoutCovers: CatalogGame[] = [];

(steamripData as any[]).forEach((item, index) => {
  const safeId = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const hasAppId = item.appId && item.appId > 0;
  const hasDirect = (directCoversMap as Record<string, string>)[String(item.appId)];
  const hasCover = Boolean(hasAppId || hasDirect);

  const gameObj: CatalogGame = {
    id: `rip_${index}_${safeId}`,
    appId: item.appId || 0,
    title: item.title,
    ripUrl: item.ripUrl,
    hasCover,
  };

  if (hasCover) {
    withCovers.push(gameObj);
  } else {
    withoutCovers.push(gameObj);
  }
});

// Resmi olan tüm oyunlar en başta (870+ oyun), resmi olmayanlar en arkada listelenir
export const ALL_STEAMRIP_GAMES: CatalogGame[] = [...withCovers, ...withoutCovers];

export const DEFAULT_POPULAR_GAMES: CatalogGame[] = ALL_STEAMRIP_GAMES;

export async function fetchTopSteamGames(): Promise<CatalogGame[]> {
  return ALL_STEAMRIP_GAMES;
}

export async function searchSteamStore(query: string): Promise<CatalogGame[]> {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_STEAMRIP_GAMES;

  // Arama sonuçlarında da önce resimli olanları öne çıkar
  const filtered = ALL_STEAMRIP_GAMES.filter((g) => g.title.toLowerCase().includes(q));
  return filtered.sort((a, b) => {
    if (a.hasCover && !b.hasCover) return -1;
    if (!a.hasCover && b.hasCover) return 1;
    return 0;
  });
}
