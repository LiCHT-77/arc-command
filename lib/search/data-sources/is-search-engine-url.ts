/**
 * 検索エンジンのURLパターン
 */
const SEARCH_ENGINE_PATTERNS = [
	/^https?:\/\/(www\.)?google\.[a-z.]+\/search/,
	/^https?:\/\/(www\.)?bing\.com\/search/,
	/^https?:\/\/search\.yahoo\./,
	/^https?:\/\/(www\.)?duckduckgo\.com\/\?/,
	/^https?:\/\/(www\.)?baidu\.com\/s/,
];

/**
 * URLが検索エンジンの検索結果ページかどうかを判定する
 */
export function isSearchEngineUrl(url: string): boolean {
	return SEARCH_ENGINE_PATTERNS.some((pattern) => pattern.test(url));
}
