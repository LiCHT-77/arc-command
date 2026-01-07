import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShadowContainerProvider } from "@/lib/shadow-container-context";
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

// テスト用のラッパーコンポーネント
function TestWrapper({ children }: { children: React.ReactNode }) {
	return (
		<ShadowContainerProvider container={document.body}>
			{children}
		</ShadowContainerProvider>
	);
}

describe("App", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// デフォルトで空の結果を返す
		vi.mocked(searchBookmarks).mockResolvedValue({ items: [] });
		vi.mocked(searchTabs).mockResolvedValue({ items: [] });
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("キーボードショートカット", () => {
		it("cmd + shift + K でCommandDialogが開く", async () => {
			render(<App />, { wrapper: TestWrapper });

			// 初期状態ではCommandDialogは表示されていない
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

			// cmd + shift + K を押す
			fireEvent.keyDown(document, {
				key: "k",
				metaKey: true,
				shiftKey: true,
			});

			// CommandDialogが表示される
			await waitFor(() => {
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});
		});

		it("Escapeで閉じる", async () => {
			render(<App />, { wrapper: TestWrapper });

			// 開く
			fireEvent.keyDown(document, {
				key: "k",
				metaKey: true,
				shiftKey: true,
			});

			await waitFor(() => {
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});

			// Escapeで閉じる
			fireEvent.keyDown(document, { key: "Escape" });

			await waitFor(() => {
				expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
			});
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

			render(<App />, { wrapper: TestWrapper });

			// 開く
			fireEvent.keyDown(document, {
				key: "k",
				metaKey: true,
				shiftKey: true,
			});

			await waitFor(() => {
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});

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

			render(<App />, { wrapper: TestWrapper });

			// 開く
			fireEvent.keyDown(document, {
				key: "k",
				metaKey: true,
				shiftKey: true,
			});

			await waitFor(() => {
				expect(screen.getByRole("dialog")).toBeInTheDocument();
			});

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
