// 検索結果の型
export type SearchResultType =
	| "history"
	| "tab"
	| "suggestion"
	| "bookmark"
	| "command";

// 統一された検索結果アイテム型
export interface SearchResult {
	id: string;
	type: SearchResultType;
	title: string;
	subtitle?: string;
	url?: string;
	icon?: string; // アイコン名やURL（表示側で処理）
	score: number; // 関連度スコア（混在表示用、0-1の範囲を推奨）
	onSelect: () => void | Promise<void>;
}

// 各データソースが実装するインターフェース
export interface DataSource {
	type: SearchResultType;
	search: (query: string) => Promise<SearchResult[]>;
}
