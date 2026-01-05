import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { Command } from "@/components/ui/command";
import { SearchResultItem } from "./search-result-item";
import type { SearchResult } from "@/lib/search/types";

// CommandItemはCommandコンテキストが必要なため、ラッパーを追加
function TestWrapper({ children }: { children: React.ReactNode }) {
	return <Command>{children}</Command>;
}

describe("SearchResultItem", () => {
	afterEach(() => {
		cleanup();
	});
	it("タイトルとサブタイトルを表示する", () => {
		const result: SearchResult = {
			id: "1",
			type: "history",
			title: "Example Site",
			subtitle: "https://example.com",
			url: "https://example.com",
			score: 0.8,
			onSelect: vi.fn(),
		};

		render(<SearchResultItem result={result} />, {
			wrapper: TestWrapper,
		});

		expect(screen.getByText("Example Site")).toBeInTheDocument();
		expect(screen.getByText("https://example.com")).toBeInTheDocument();
	});

	it("サブタイトルがない場合はURLをサブタイトルとして表示する", () => {
		const result: SearchResult = {
			id: "1",
			type: "history",
			title: "Example Site",
			url: "https://example.com",
			score: 0.8,
			onSelect: vi.fn(),
		};

		render(<SearchResultItem result={result} />, {
			wrapper: TestWrapper,
		});

		expect(screen.getByText("Example Site")).toBeInTheDocument();
		expect(screen.getByText("https://example.com")).toBeInTheDocument();
	});

	it("URLがない場合はサブタイトルのみを表示する", () => {
		const result: SearchResult = {
			id: "1",
			type: "command",
			title: "設定を開く",
			subtitle: "アプリケーションの設定を開きます",
			score: 0.8,
			onSelect: vi.fn(),
		};

		render(<SearchResultItem result={result} />, {
			wrapper: TestWrapper,
		});

		expect(screen.getByText("設定を開く")).toBeInTheDocument();
		expect(screen.getByText("アプリケーションの設定を開きます")).toBeInTheDocument();
	});

	it("タイトルが長い場合はtruncateされる", () => {
		const longTitle = "a".repeat(100);
		const result: SearchResult = {
			id: "1",
			type: "history",
			title: longTitle,
			url: "https://example.com",
			score: 0.8,
			onSelect: vi.fn(),
		};

		const { container } = render(<SearchResultItem result={result} />, {
			wrapper: TestWrapper,
		});

		const titleElement = container.querySelector(".truncate");
		expect(titleElement).toBeInTheDocument();
		expect(titleElement?.textContent).toBe(longTitle);
	});

	it("サブタイトルが長い場合はtruncateされる", () => {
		const longUrl = "https://example.com/" + "a".repeat(100);
		const result: SearchResult = {
			id: "1",
			type: "history",
			title: "Example",
			url: longUrl,
			score: 0.8,
			onSelect: vi.fn(),
		};

		const { container } = render(<SearchResultItem result={result} />, {
			wrapper: TestWrapper,
		});

		const subtitleElements = container.querySelectorAll(".truncate");
		expect(subtitleElements.length).toBeGreaterThan(0);
	});
});
