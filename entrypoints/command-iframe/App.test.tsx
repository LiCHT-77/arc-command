import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Mock the messages module
vi.mock("@/lib/messages", () => ({
	searchBookmarks: vi.fn(),
	searchHistory: vi.fn(),
	openTab: vi.fn(),
	searchTabs: vi.fn(),
	switchToTab: vi.fn(),
}));

import {
	openTab,
	searchBookmarks,
	searchHistory,
	searchTabs,
} from "@/lib/messages";

describe("iframe App", () => {
	let postMessageSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		// デフォルトで空の結果を返す
		vi.mocked(searchBookmarks).mockResolvedValue({ items: [] });
		vi.mocked(searchTabs).mockResolvedValue({ items: [] });

		// window.parent.postMessage をモック
		postMessageSpy = vi.spyOn(window.parent, "postMessage");
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	describe("初期表示", () => {
		it("Appがレンダリングされる", () => {
			render(<App />);

			// 検索入力フィールドが表示される
			expect(screen.getByRole("combobox")).toBeInTheDocument();
		});

		it("プレースホルダーが表示される", () => {
			render(<App />);

			expect(
				screen.getByPlaceholderText("タブ・ブックマーク・履歴を検索..."),
			).toBeInTheDocument();
		});
	});

	describe("postMessage通信", () => {
		it("Escapeキーで親ウィンドウにcloseメッセージを送信する", async () => {
			render(<App />);

			// Escapeを押す
			fireEvent.keyDown(document, { key: "Escape" });

			expect(postMessageSpy).toHaveBeenCalledWith(
				{ type: "arc-command:close" },
				"*",
			);
		});

		it("アイテム選択後に親ウィンドウにcloseメッセージを送信する", async () => {
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

			render(<App />);

			// 検索
			const input = screen.getByRole("combobox");
			fireEvent.change(input, { target: { value: "example" } });

			await waitFor(() => {
				expect(screen.getByText("Example Site")).toBeInTheDocument();
			});

			// アイテムを選択
			const item = screen.getByText("Example Site");
			fireEvent.click(item);

			// openTabが呼ばれる
			await waitFor(() => {
				expect(mockOpenTab).toHaveBeenCalledWith("https://example.com");
			});

			// 親ウィンドウにcloseメッセージが送信される
			expect(postMessageSpy).toHaveBeenCalledWith(
				{ type: "arc-command:close" },
				"*",
			);
		});
	});

	describe("履歴検索", () => {
		it("検索クエリを入力すると履歴を検索する", async () => {
			const mockSearchHistory = vi.mocked(searchHistory);
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

			render(<App />);

			// 検索クエリを入力
			const input = screen.getByRole("combobox");
			fireEvent.change(input, { target: { value: "example" } });

			// searchHistoryが呼ばれる
			await waitFor(() => {
				expect(mockSearchHistory).toHaveBeenCalledWith("example");
			});

			// 結果が表示される
			await waitFor(() => {
				expect(screen.getByText("Example Site")).toBeInTheDocument();
			});
		});

		it("履歴アイテムを選択すると新しいタブを開く", async () => {
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

			render(<App />);

			// 検索
			const input = screen.getByRole("combobox");
			fireEvent.change(input, { target: { value: "example" } });

			await waitFor(() => {
				expect(screen.getByText("Example Site")).toBeInTheDocument();
			});

			// アイテムを選択
			const item = screen.getByText("Example Site");
			fireEvent.click(item);

			// openTabが呼ばれる
			await waitFor(() => {
				expect(mockOpenTab).toHaveBeenCalledWith("https://example.com");
			});
		});
	});
});
