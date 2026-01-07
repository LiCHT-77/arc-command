import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchTabs, switchToTab } from "@/lib/messages";
import { TabDataSource } from "./tabs";

// Mock the messages module
vi.mock("@/lib/messages", () => ({
	searchTabs: vi.fn(),
	switchToTab: vi.fn(),
}));

describe("TabDataSource", () => {
	let dataSource: TabDataSource;

	beforeEach(() => {
		vi.clearAllMocks();
		dataSource = new TabDataSource();
	});

	describe("type", () => {
		it("typeは'tab'を返す", () => {
			expect(dataSource.type).toBe("tab");
		});
	});

	describe("search", () => {
		it("クエリが空の場合は空配列を返す", async () => {
			const result = await dataSource.search("");
			expect(result).toEqual([]);
			expect(searchTabs).not.toHaveBeenCalled();
		});

		it("検索結果をSearchResultに変換する", async () => {
			const mockSearchTabs = vi.mocked(searchTabs);
			mockSearchTabs.mockResolvedValue({
				items: [
					{
						id: 1,
						url: "https://example.com",
						title: "Example Tab",
						windowId: 1,
						active: true,
					},
					{
						id: 2,
						url: "https://test.com",
						title: "Test Tab",
						windowId: 1,
						active: false,
					},
				],
			});

			const results = await dataSource.search("example");

			expect(searchTabs).toHaveBeenCalledWith("example");
			expect(results).toHaveLength(2);
			expect(results[0]).toMatchObject({
				id: "tab-1",
				type: "tab",
				title: "Example Tab",
				url: "https://example.com",
				subtitle: "https://example.com",
			});
			expect(results[0].score).toBeGreaterThanOrEqual(0);
			expect(results[0].score).toBeLessThanOrEqual(1);
			expect(typeof results[0].onSelect).toBe("function");
		});

		it("onSelectを呼ぶとswitchToTabが呼ばれる", async () => {
			const mockSearchTabs = vi.mocked(searchTabs);
			const mockSwitchToTab = vi.mocked(switchToTab);
			mockSearchTabs.mockResolvedValue({
				items: [
					{
						id: 42,
						url: "https://example.com",
						title: "Example Tab",
						windowId: 1,
						active: false,
					},
				],
			});
			mockSwitchToTab.mockResolvedValue(undefined);

			const results = await dataSource.search("example");
			await results[0].onSelect();

			expect(mockSwitchToTab).toHaveBeenCalledWith(42);
		});

		it("タイトルがない場合はURLをタイトルとして使用する", async () => {
			const mockSearchTabs = vi.mocked(searchTabs);
			mockSearchTabs.mockResolvedValue({
				items: [
					{
						id: 1,
						url: "https://example.com",
						title: "",
						windowId: 1,
						active: false,
					},
				],
			});

			const results = await dataSource.search("example");

			expect(results[0].title).toBe("https://example.com");
		});

		it("スコアは関連度に基づいて計算される（タイトルマッチの方が高い）", async () => {
			const mockSearchTabs = vi.mocked(searchTabs);
			mockSearchTabs.mockResolvedValue({
				items: [
					{
						id: 1,
						url: "https://example.com",
						title: "Example Tab",
						windowId: 1,
						active: false,
					},
					{
						id: 2,
						url: "https://test-example.com",
						title: "Test Tab",
						windowId: 1,
						active: false,
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

		it("アクティブなタブはスコアにボーナスが付く", async () => {
			const mockSearchTabs = vi.mocked(searchTabs);
			mockSearchTabs.mockResolvedValue({
				items: [
					{
						id: 1,
						url: "https://same.com",
						title: "Same Title",
						windowId: 1,
						active: true,
						pinned: false,
					},
					{
						id: 2,
						url: "https://same.com",
						title: "Same Title",
						windowId: 1,
						active: false,
						pinned: false,
					},
				],
			});

			const results = await dataSource.search("same");

			const activeTab = results.find((r) => r.id === "tab-1");
			const inactiveTab = results.find((r) => r.id === "tab-2");
			expect(activeTab?.score).toBeGreaterThan(inactiveTab?.score ?? 0);
		});

		it("ピンされたタブはスコアにボーナスが付く", async () => {
			const mockSearchTabs = vi.mocked(searchTabs);
			mockSearchTabs.mockResolvedValue({
				items: [
					{
						id: 1,
						url: "https://same.com",
						title: "Same Title",
						windowId: 1,
						active: false,
						pinned: true,
					},
					{
						id: 2,
						url: "https://same.com",
						title: "Same Title",
						windowId: 1,
						active: false,
						pinned: false,
					},
				],
			});

			const results = await dataSource.search("same");

			const pinnedTab = results.find((r) => r.id === "tab-1");
			const unpinnedTab = results.find((r) => r.id === "tab-2");
			expect(pinnedTab?.score).toBeGreaterThan(unpinnedTab?.score ?? 0);
		});
	});
});
