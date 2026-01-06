import { useEffect, useRef, useState } from "react";
import type { DataSource, SearchResult } from "./types";

interface UseSearchOptions {
	debounceMs?: number;
}

interface UseSearchReturn {
	results: SearchResult[];
	isLoading: boolean;
}

/**
 * 複数のDataSourceから検索結果を取得し、スコア順にソートするフック
 */
export function useSearch(
	query: string,
	dataSources: DataSource[],
	options: UseSearchOptions = {},
): UseSearchReturn {
	const { debounceMs = 150 } = options;
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const dataSourcesRef = useRef(dataSources);

	// dataSourcesの参照を最新に保つ
	useEffect(() => {
		dataSourcesRef.current = dataSources;
	}, [dataSources]);

	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);

		const timeoutId = setTimeout(async () => {
			try {
				// 全てのDataSourceから並列に検索
				const searchPromises = dataSourcesRef.current.map((source) =>
					source.search(query),
				);
				const settledResults = await Promise.allSettled(searchPromises);

				// 成功した結果のみを抽出してマージ
				const allResults = settledResults
					.filter(
						(result): result is PromiseFulfilledResult<SearchResult[]> =>
							result.status === "fulfilled",
					)
					.flatMap((result) => result.value);

				// 失敗したDataSourceのエラーをログに記録
				settledResults.forEach((result, index) => {
					if (result.status === "rejected") {
						console.error(
							`DataSource search failed:`,
							dataSourcesRef.current[index]?.type,
							result.reason,
						);
					}
				});

				// 結果をスコア順にソート
				const mergedResults = allResults.sort((a, b) => b.score - a.score);

				setResults(mergedResults);
			} catch (error) {
				console.error("Unexpected search error:", error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, debounceMs);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [query, debounceMs]);

	return { results, isLoading };
}
