import { describe, expect, it, vi } from "vitest";
import { deduplicateByUrl } from "./deduplicate-by-url";
import type { SearchResult } from "./types";

describe("deduplicateByUrl", () => {
	it("空配列を渡すと空配列を返す", () => {
		const result = deduplicateByUrl([]);
		expect(result).toEqual([]);
	});

	it("重複がなければそのまま返す", () => {
		const results: SearchResult[] = [
			{
				id: "1",
				type: "tab",
				title: "Example",
				url: "https://example.com",
				score: 0.9,
				onSelect: vi.fn(),
			},
			{
				id: "2",
				type: "history",
				title: "Other",
				url: "https://other.com",
				score: 0.8,
				onSelect: vi.fn(),
			},
		];

		const result = deduplicateByUrl(results);
		expect(result).toHaveLength(2);
		expect(result).toEqual(results);
	});

	it("同じURLでタブと履歴がある場合、タブを残す", () => {
		const tab: SearchResult = {
			id: "1",
			type: "tab",
			title: "Example Tab",
			url: "https://example.com",
			score: 0.5,
			onSelect: vi.fn(),
		};
		const history: SearchResult = {
			id: "2",
			type: "history",
			title: "Example History",
			url: "https://example.com",
			score: 0.9,
			onSelect: vi.fn(),
		};

		const result = deduplicateByUrl([history, tab]);
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe("tab");
	});

	it("同じURLで履歴のみ複数ある場合、スコアが高い方を残す", () => {
		const history1: SearchResult = {
			id: "1",
			type: "history",
			title: "Example History 1",
			url: "https://example.com",
			score: 0.5,
			onSelect: vi.fn(),
		};
		const history2: SearchResult = {
			id: "2",
			type: "history",
			title: "Example History 2",
			url: "https://example.com",
			score: 0.9,
			onSelect: vi.fn(),
		};

		const result = deduplicateByUrl([history1, history2]);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe("2");
	});
});
