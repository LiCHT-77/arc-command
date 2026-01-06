import type { HistoryItem } from "@/lib/messages";
import { openTab, searchHistory } from "@/lib/messages";
import type { DataSource, SearchResult } from "../types";

/**
 * 履歴検索のデータソース
 */
export class HistoryDataSource implements DataSource {
	type = "history" as const;

	/**
	 * クエリに基づいて履歴を検索し、SearchResultに変換する
	 */
	async search(query: string): Promise<SearchResult[]> {
		if (!query.trim()) {
			return [];
		}

		const response = await searchHistory(query);
		return response.items.map((item) => this.toSearchResult(item, query));
	}

	/**
	 * HistoryItemをSearchResultに変換する
	 */
	private toSearchResult(item: HistoryItem, query: string): SearchResult {
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

		// 最近訪問したものほどスコアを上げる（最大0.1ポイント）
		if (item.lastVisitTime) {
			const daysSinceVisit =
				(Date.now() - item.lastVisitTime) / (1000 * 60 * 60 * 24);
			const recencyBonus = Math.max(0, 0.1 * (1 - daysSinceVisit / 30));
			score += recencyBonus;
		}

		score = Math.min(1, Math.max(0, score)); // 0-1の範囲に制限

		return {
			id: item.id,
			type: "history",
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
