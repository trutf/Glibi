import steamripData from "../data/steamrip_catalog.json";

export interface CatalogGame {
  id: string;
  appId: number;
  title: string;
  ripUrl?: string;
}

export const ALL_STEAMRIP_GAMES: CatalogGame[] = (steamripData as any[]).map((item, index) => {
  const safeId = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return {
    id: `rip_${index}_${safeId}`,
    appId: item.appId || 0,
    title: item.title,
    ripUrl: item.ripUrl,
  };
});

export const DEFAULT_POPULAR_GAMES: CatalogGame[] = ALL_STEAMRIP_GAMES.slice(0, 500);

export async function fetchTopSteamGames(): Promise<CatalogGame[]> {
  return ALL_STEAMRIP_GAMES;
}

export async function searchSteamStore(query: string): Promise<CatalogGame[]> {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_STEAMRIP_GAMES.slice(0, 72);

  return ALL_STEAMRIP_GAMES.filter((g) => g.title.toLowerCase().includes(q));
}
