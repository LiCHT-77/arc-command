import type { SearchResult } from "./types";

export function deduplicateByUrl(results: SearchResult[]): SearchResult[] {
	const urlMap = new Map<string, SearchResult>();

	for (const result of results) {
		const url = result.url;
		if (!url) continue;

		const existing = urlMap.get(url);
		if (!existing) {
			urlMap.set(url, result);
		} else if (result.type === "tab" && existing.type !== "tab") {
			urlMap.set(url, result);
		} else if (existing.type !== "tab" && result.score > existing.score) {
			urlMap.set(url, result);
		}
	}

	return Array.from(urlMap.values());
}
