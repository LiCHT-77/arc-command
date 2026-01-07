import type { BookmarkItem } from "@/lib/messages";
import { openTab, searchBookmarks } from "@/lib/messages";
import type { DataSource, SearchResult } from "../types";

/**
 * ブックマーク検索のデータソース
 */
export class BookmarkDataSource implements DataSource {
	type = "bookmark" as const;

	/**
	 * クエリに基づいてブックマークを検索し、SearchResultに変換する
	 */
	async search(query: string): Promise<SearchResult[]> {
		if (!query.trim()) {
			return [];
		}

		const response = await searchBookmarks(query);
		return response.items.map((item) => this.toSearchResult(item, query));
	}

	/**
	 * BookmarkItemをSearchResultに変換する
	 */
	private toSearchResult(item: BookmarkItem, query: string): SearchResult {
		const title = item.title || item.url;
		const queryNormalized = query.toLowerCase().normalize("NFKC");
		const titleNormalized = title.toLowerCase().normalize("NFKC");
		const urlNormalized = item.url.toLowerCase().normalize("NFKC");

		// スコア計算: タイトルマッチ > URLマッチ、完全一致 > 部分一致
		let score = 0;
		if (titleNormalized === queryNormalized) {
			score = 1.0;
		} else if (titleNormalized.startsWith(queryNormalized)) {
			score = 0.8;
		} else if (titleNormalized.includes(queryNormalized)) {
			score = 0.6;
		} else if (urlNormalized.includes(queryNormalized)) {
			score = 0.4;
		}

		score = Math.min(1, Math.max(0, score)); // 0-1の範囲に制限

		return {
			id: `bookmark-${item.id}`,
			type: "bookmark",
			title,
			subtitle: item.url,
			url: item.url,
			score,
			onSelect: async () => {
				await openTab(item.url);
			},
		};
	}
}
