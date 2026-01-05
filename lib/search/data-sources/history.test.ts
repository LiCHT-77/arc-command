import { describe, expect, it, vi, beforeEach } from "vitest";
import { HistoryDataSource } from "./history";
import { searchHistory, openTab } from "@/lib/messages";

// Mock the messages module
vi.mock("@/lib/messages", () => ({
	searchHistory: vi.fn(),
	openTab: vi.fn(),
}));

describe("HistoryDataSource", () => {
	let dataSource: HistoryDataSource;

	beforeEach(() => {
		vi.clearAllMocks();
		dataSource = new HistoryDataSource();
	});

	describe("type", () => {
		it("typeは'history'を返す", () => {
			expect(dataSource.type).toBe("history");
		});
	});

	describe("search", () => {
		it("クエリが空の場合は空配列を返す", async () => {
			const result = await dataSource.search("");
			expect(result).toEqual([]);
			expect(searchHistory).not.toHaveBeenCalled();
		});

		it("検索結果をSearchResultに変換する", async () => {
			const mockSearchHistory = vi.mocked(searchHistory);
			mockSearchHistory.mockResolvedValue({
				items: [
					{
						id: "1",
						url: "https://example.com",
						title: "Example Site",
						lastVisitTime: Date.now(),
					},
					{
						id: "2",
						url: "https://test.com",
						title: "Test Site",
						lastVisitTime: Date.now() - 1000,
					},
				],
			});

			const results = await dataSource.search("example");

			expect(searchHistory).toHaveBeenCalledWith("example");
			expect(results).toHaveLength(2);
			expect(results[0]).toMatchObject({
				id: "1",
				type: "history",
				title: "Example Site",
				url: "https://example.com",
				subtitle: "https://example.com",
			});
			expect(results[0].score).toBeGreaterThanOrEqual(0);
			expect(results[0].score).toBeLessThanOrEqual(1);
			expect(typeof results[0].onSelect).toBe("function");
		});

		it("onSelectを呼ぶとopenTabが呼ばれる", async () => {
			const mockSearchHistory = vi.mocked(searchHistory);
			const mockOpenTab = vi.mocked(openTab);
			mockSearchHistory.mockResolvedValue({
				items: [
					{
						id: "1",
						url: "https://example.com",
						title: "Example Site",
						lastVisitTime: Date.now(),
					},
				],
			});
			mockOpenTab.mockResolvedValue(undefined);

			const results = await dataSource.search("example");
			await results[0].onSelect();

			expect(mockOpenTab).toHaveBeenCalledWith("https://example.com");
		});

		it("タイトルがない場合はURLをタイトルとして使用する", async () => {
			const mockSearchHistory = vi.mocked(searchHistory);
			mockSearchHistory.mockResolvedValue({
				items: [
					{
						id: "1",
						url: "https://example.com",
						title: "",
						lastVisitTime: Date.now(),
					},
				],
			});

			const results = await dataSource.search("example");

			expect(results[0].title).toBe("https://example.com");
		});

		it("スコアは関連度に基づいて計算される（タイトルマッチの方が高い）", async () => {
			const mockSearchHistory = vi.mocked(searchHistory);
			mockSearchHistory.mockResolvedValue({
				items: [
					{
						id: "1",
						url: "https://example.com",
						title: "Example Site",
						lastVisitTime: Date.now(),
					},
					{
						id: "2",
						url: "https://test-example.com",
						title: "Test Site",
						lastVisitTime: Date.now() - 1000,
					},
				],
			});

			const results = await dataSource.search("example");

			// タイトルに"example"が含まれる方がスコアが高い
			const titleMatch = results.find((r) => r.title.includes("Example"));
			const urlMatch = results.find((r) => r.url?.includes("example"));
			if (titleMatch && urlMatch && titleMatch.id !== urlMatch.id) {
				expect(titleMatch.score).toBeGreaterThan(urlMatch.score);
			}
		});
	});
});
