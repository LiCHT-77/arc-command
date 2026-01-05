import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSearch } from "./use-search";
import type { DataSource, SearchResult } from "./types";

describe("useSearch", () => {
	let mockDataSource1: DataSource;
	let mockDataSource2: DataSource;

	beforeEach(() => {
		vi.clearAllMocks();

		mockDataSource1 = {
			type: "history",
			search: vi.fn(),
		};

		mockDataSource2 = {
			type: "tab",
			search: vi.fn(),
		};
	});

	describe("初期状態", () => {
		it("クエリが空の場合は空配列を返す", () => {
			const { result } = renderHook(() =>
				useSearch("", [mockDataSource1]),
			);

			expect(result.current.results).toEqual([]);
			expect(result.current.isLoading).toBe(false);
		});
	});

	describe("検索", () => {
		it("単一のDataSourceから結果を取得する", async () => {
			const mockResults: SearchResult[] = [
				{
					id: "1",
					type: "history",
					title: "Example",
					url: "https://example.com",
					score: 0.8,
					onSelect: vi.fn(),
				},
			];

			vi.mocked(mockDataSource1.search).mockResolvedValue(mockResults);

			const { result } = renderHook(() =>
				useSearch("example", [mockDataSource1], { debounceMs: 0 }),
			);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(mockDataSource1.search).toHaveBeenCalledWith("example");
			expect(result.current.results).toEqual(mockResults);
		});

		it("複数のDataSourceから結果を取得し、スコア順にソートする", async () => {
			const mockResults1: SearchResult[] = [
				{
					id: "1",
					type: "history",
					title: "Example",
					url: "https://example.com",
					score: 0.5,
					onSelect: vi.fn(),
				},
			];

			const mockResults2: SearchResult[] = [
				{
					id: "2",
					type: "tab",
					title: "Example Tab",
					url: "https://example.com/tab",
					score: 0.9,
					onSelect: vi.fn(),
				},
			];

			vi.mocked(mockDataSource1.search).mockResolvedValue(mockResults1);
			vi.mocked(mockDataSource2.search).mockResolvedValue(mockResults2);

			const { result } = renderHook(() =>
				useSearch("example", [mockDataSource1, mockDataSource2], {
					debounceMs: 0,
				}),
			);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.results).toHaveLength(2);
			// スコアが高い順にソートされている
			expect(result.current.results[0].score).toBe(0.9);
			expect(result.current.results[1].score).toBe(0.5);
		});

		it("検索中はisLoadingがtrueになる", async () => {
			let resolveSearch: ((value: SearchResult[]) => void) | undefined;
			const searchPromise = new Promise<SearchResult[]>((resolve) => {
				resolveSearch = resolve;
			});

			vi.mocked(mockDataSource1.search).mockReturnValue(searchPromise);

			const { result } = renderHook(() =>
				useSearch("example", [mockDataSource1], { debounceMs: 0 }),
			);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(true);
			});

			if (resolveSearch) {
				resolveSearch([]);
			}

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});
		});

		it("クエリが変更されると再検索する（debounce）", async () => {
			vi.mocked(mockDataSource1.search).mockResolvedValue([]);

			const { rerender } = renderHook(
				({ query }) =>
					useSearch(query, [mockDataSource1], { debounceMs: 0 }),
				{
					initialProps: { query: "test1" },
				},
			);

			await waitFor(() => {
				expect(mockDataSource1.search).toHaveBeenCalledWith("test1");
			});

			vi.clearAllMocks();

			rerender({ query: "test2" });

			await waitFor(() => {
				expect(mockDataSource1.search).toHaveBeenCalledWith("test2");
			});
		});

		it("クエリが空になると結果をクリアする", async () => {
			const mockResults: SearchResult[] = [
				{
					id: "1",
					type: "history",
					title: "Example",
					url: "https://example.com",
					score: 0.8,
					onSelect: vi.fn(),
				},
			];

			vi.mocked(mockDataSource1.search).mockResolvedValue(mockResults);

			const { result, rerender } = renderHook(
				({ query }) =>
					useSearch(query, [mockDataSource1], { debounceMs: 0 }),
				{
					initialProps: { query: "example" },
				},
			);

			await waitFor(() => {
				expect(result.current.results).toHaveLength(1);
			});

			vi.clearAllMocks();

			rerender({ query: "" });

			await waitFor(() => {
				expect(result.current.results).toEqual([]);
			});

			// クエリが空になった後は検索が呼ばれない
			expect(mockDataSource1.search).not.toHaveBeenCalled();
		});

		it("一部のDataSourceが失敗しても成功したDataSourceの結果を返す", async () => {
			const mockResults1: SearchResult[] = [
				{
					id: "1",
					type: "history",
					title: "Example",
					url: "https://example.com",
					score: 0.8,
					onSelect: vi.fn(),
				},
			];

			vi.mocked(mockDataSource1.search).mockResolvedValue(mockResults1);
			vi.mocked(mockDataSource2.search).mockRejectedValue(
				new Error("Network error"),
			);

			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() =>
				useSearch("example", [mockDataSource1, mockDataSource2], {
					debounceMs: 0,
				}),
			);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// 成功したDataSourceの結果が返される
			expect(result.current.results).toHaveLength(1);
			expect(result.current.results[0]).toEqual(mockResults1[0]);

			// エラーがログに記録される
			expect(consoleSpy).toHaveBeenCalledWith(
				"DataSource search failed:",
				"tab",
				expect.any(Error),
			);

			consoleSpy.mockRestore();
		});

		it("全てのDataSourceが失敗した場合は空配列を返す", async () => {
			vi.mocked(mockDataSource1.search).mockRejectedValue(
				new Error("Network error 1"),
			);
			vi.mocked(mockDataSource2.search).mockRejectedValue(
				new Error("Network error 2"),
			);

			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			const { result } = renderHook(() =>
				useSearch("example", [mockDataSource1, mockDataSource2], {
					debounceMs: 0,
				}),
			);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// 空配列が返される
			expect(result.current.results).toEqual([]);

			// 両方のエラーがログに記録される
			expect(consoleSpy).toHaveBeenCalledTimes(2);

			consoleSpy.mockRestore();
		});
	});
});
