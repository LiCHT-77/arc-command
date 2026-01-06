import type { TabItem } from "@/lib/messages";
import { searchTabs, switchToTab } from "@/lib/messages";
import type { DataSource, SearchResult } from "../types";

/**
 * タブ検索のデータソース
 */
export class TabDataSource implements DataSource {
	type = "tab" as const;

	/**
	 * クエリに基づいてタブを検索し、SearchResultに変換する
	 */
	async search(query: string): Promise<SearchResult[]> {
		if (!query.trim()) {
			return [];
		}

		const response = await searchTabs(query);
		return response.items.map((item) => this.toSearchResult(item, query));
	}

	/**
	 * TabItemをSearchResultに変換する
	 */
	private toSearchResult(item: TabItem, query: string): SearchResult {
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

		// アクティブなタブにはボーナスを付ける
		if (item.active) {
			score += 0.05;
		}

		score = Math.min(1, Math.max(0, score)); // 0-1の範囲に制限

		return {
			id: `tab-${item.id}`,
			type: "tab",
			title,
			subtitle: item.url,
			url: item.url,
			score,
			onSelect: async () => {
				await switchToTab(item.id);
			},
		};
	}
}
