import type { DataSource, SearchResult } from "../types";
import { searchHistory, openTab } from "@/lib/messages";
import type { HistoryItem } from "@/lib/messages";

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
		const queryLower = query.toLowerCase();
		const titleLower = title.toLowerCase();
		const urlLower = item.url.toLowerCase();

		// スコア計算: タイトルマッチ > URLマッチ、完全一致 > 部分一致
		let score = 0;
		if (titleLower === queryLower) {
			score = 1.0;
		} else if (titleLower.startsWith(queryLower)) {
			score = 0.8;
		} else if (titleLower.includes(queryLower)) {
			score = 0.6;
		} else if (urlLower.includes(queryLower)) {
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
