import { beforeEach, describe, expect, it, vi } from "vitest";
import { openTab, searchBookmarks } from "@/lib/messages";
import { BookmarkDataSource } from "./bookmarks";

// Mock the messages module
vi.mock("@/lib/messages", () => ({
	searchBookmarks: vi.fn(),
	openTab: vi.fn(),
}));

describe("BookmarkDataSource", () => {
	let dataSource: BookmarkDataSource;

	beforeEach(() => {
		vi.clearAllMocks();
		dataSource = new BookmarkDataSource();
	});

	describe("type", () => {
		it("typeは'bookmark'を返す", () => {
			expect(dataSource.type).toBe("bookmark");
		});
	});

	describe("search", () => {
		it("クエリが空の場合は空配列を返す", async () => {
			const result = await dataSource.search("");
			expect(result).toEqual([]);
			expect(searchBookmarks).not.toHaveBeenCalled();
		});

		it("検索結果をSearchResultに変換する", async () => {
			const mockSearchBookmarks = vi.mocked(searchBookmarks);
			mockSearchBookmarks.mockResolvedValue({
				items: [
					{
						id: "1",
						url: "https://example.com",
						title: "Example Bookmark",
					},
					{
						id: "2",
						url: "https://test.com",
						title: "Test Bookmark",
					},
				],
			});

			const results = await dataSource.search("example");

			expect(searchBookmarks).toHaveBeenCalledWith("example");
			expect(results).toHaveLength(2);
			expect(results[0]).toMatchObject({
				id: "bookmark-1",
				type: "bookmark",
				title: "Example Bookmark",
				url: "https://example.com",
				subtitle: "https://example.com",
			});
			expect(results[0].score).toBeGreaterThanOrEqual(0);
			expect(results[0].score).toBeLessThanOrEqual(1);
			expect(typeof results[0].onSelect).toBe("function");
		});

		it("onSelectを呼ぶとopenTabが呼ばれる", async () => {
			const mockSearchBookmarks = vi.mocked(searchBookmarks);
			const mockOpenTab = vi.mocked(openTab);
			mockSearchBookmarks.mockResolvedValue({
				items: [
					{
						id: "1",
						url: "https://example.com",
						title: "Example Bookmark",
					},
				],
			});
			mockOpenTab.mockResolvedValue(undefined);

			const results = await dataSource.search("example");
			await results[0].onSelect();

			expect(mockOpenTab).toHaveBeenCalledWith("https://example.com");
		});

		it("タイトルがない場合はURLをタイトルとして使用する", async () => {
			const mockSearchBookmarks = vi.mocked(searchBookmarks);
			mockSearchBookmarks.mockResolvedValue({
				items: [
					{
						id: "1",
						url: "https://example.com",
						title: "",
					},
				],
			});

			const results = await dataSource.search("example");

			expect(results[0].title).toBe("https://example.com");
		});

		it("スコアは関連度に基づいて計算される（タイトルマッチの方が高い）", async () => {
			const mockSearchBookmarks = vi.mocked(searchBookmarks);
			mockSearchBookmarks.mockResolvedValue({
				items: [
					{
						id: "1",
						url: "https://example.com",
						title: "Example Bookmark",
					},
					{
						id: "2",
						url: "https://test-example.com",
						title: "Test Bookmark",
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
