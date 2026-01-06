// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	createOpenTabMessage,
	createSearchHistoryMessage,
	createSearchTabsMessage,
	createSwitchToTabMessage,
	type HistoryItem,
	isOpenTabMessage,
	isSearchHistoryMessage,
	isSearchTabsMessage,
	isSwitchToTabMessage,
	type Message,
	openTab,
	type SearchHistoryResponse,
	type SearchTabsResponse,
	searchHistory,
	searchTabs,
	switchToTab,
	type TabItem,
} from "./messages";

describe("messages", () => {
	describe("createSearchHistoryMessage", () => {
		it("SEARCH_HISTORY メッセージを作成する", () => {
			const message = createSearchHistoryMessage("test query");

			expect(message).toEqual({
				type: "SEARCH_HISTORY",
				query: "test query",
			});
		});

		it("空のクエリでもメッセージを作成できる", () => {
			const message = createSearchHistoryMessage("");

			expect(message).toEqual({
				type: "SEARCH_HISTORY",
				query: "",
			});
		});
	});

	describe("createOpenTabMessage", () => {
		it("OPEN_TAB メッセージを作成する", () => {
			const message = createOpenTabMessage("https://example.com");

			expect(message).toEqual({
				type: "OPEN_TAB",
				url: "https://example.com",
			});
		});
	});

	describe("isSearchHistoryMessage", () => {
		it("SEARCH_HISTORY メッセージの場合は true を返す", () => {
			const message: Message = { type: "SEARCH_HISTORY", query: "test" };

			expect(isSearchHistoryMessage(message)).toBe(true);
		});

		it("OPEN_TAB メッセージの場合は false を返す", () => {
			const message: Message = { type: "OPEN_TAB", url: "https://example.com" };

			expect(isSearchHistoryMessage(message)).toBe(false);
		});
	});

	describe("isOpenTabMessage", () => {
		it("OPEN_TAB メッセージの場合は true を返す", () => {
			const message: Message = { type: "OPEN_TAB", url: "https://example.com" };

			expect(isOpenTabMessage(message)).toBe(true);
		});

		it("SEARCH_HISTORY メッセージの場合は false を返す", () => {
			const message: Message = { type: "SEARCH_HISTORY", query: "test" };

			expect(isOpenTabMessage(message)).toBe(false);
		});
	});

	describe("searchHistory", () => {
		let removeListener: () => void;

		beforeEach(() => {
			removeListener = () => {};
		});

		afterEach(() => {
			removeListener();
		});

		it("background に SEARCH_HISTORY メッセージを送信して結果を返す", async () => {
			const mockItems: HistoryItem[] = [
				{
					id: "1",
					url: "https://example.com",
					title: "Example",
					lastVisitTime: 1234567890,
				},
			];
			const mockResponse: SearchHistoryResponse = { items: mockItems };

			// WXT fake-browser requires a listener to be registered
			const listener = (message: Message) => {
				if (message.type === "SEARCH_HISTORY") {
					return Promise.resolve(mockResponse);
				}
			};
			browser.runtime.onMessage.addListener(listener);
			removeListener = () => browser.runtime.onMessage.removeListener(listener);

			const result = await searchHistory("example");

			expect(result).toEqual(mockResponse);
		});
	});

	describe("openTab", () => {
		let removeListener: () => void;

		beforeEach(() => {
			removeListener = () => {};
		});

		afterEach(() => {
			removeListener();
		});

		it("background に OPEN_TAB メッセージを送信する", async () => {
			let receivedMessage: Message | null = null;

			// WXT fake-browser requires a listener to be registered
			const listener = (message: Message) => {
				receivedMessage = message;
				return Promise.resolve();
			};
			browser.runtime.onMessage.addListener(listener);
			removeListener = () => browser.runtime.onMessage.removeListener(listener);

			await openTab("https://example.com");

			expect(receivedMessage).toEqual({
				type: "OPEN_TAB",
				url: "https://example.com",
			});
		});
	});

	describe("createSearchTabsMessage", () => {
		it("SEARCH_TABS メッセージを作成する", () => {
			const message = createSearchTabsMessage("test query");

			expect(message).toEqual({
				type: "SEARCH_TABS",
				query: "test query",
			});
		});

		it("空のクエリでもメッセージを作成できる", () => {
			const message = createSearchTabsMessage("");

			expect(message).toEqual({
				type: "SEARCH_TABS",
				query: "",
			});
		});
	});

	describe("createSwitchToTabMessage", () => {
		it("SWITCH_TO_TAB メッセージを作成する", () => {
			const message = createSwitchToTabMessage(123);

			expect(message).toEqual({
				type: "SWITCH_TO_TAB",
				tabId: 123,
			});
		});
	});

	describe("isSearchTabsMessage", () => {
		it("SEARCH_TABS メッセージの場合は true を返す", () => {
			const message: Message = { type: "SEARCH_TABS", query: "test" };

			expect(isSearchTabsMessage(message)).toBe(true);
		});

		it("他のメッセージの場合は false を返す", () => {
			const message: Message = { type: "OPEN_TAB", url: "https://example.com" };

			expect(isSearchTabsMessage(message)).toBe(false);
		});
	});

	describe("isSwitchToTabMessage", () => {
		it("SWITCH_TO_TAB メッセージの場合は true を返す", () => {
			const message: Message = { type: "SWITCH_TO_TAB", tabId: 123 };

			expect(isSwitchToTabMessage(message)).toBe(true);
		});

		it("他のメッセージの場合は false を返す", () => {
			const message: Message = { type: "SEARCH_HISTORY", query: "test" };

			expect(isSwitchToTabMessage(message)).toBe(false);
		});
	});

	describe("searchTabs", () => {
		let removeListener: () => void;

		beforeEach(() => {
			removeListener = () => {};
		});

		afterEach(() => {
			removeListener();
		});

		it("background に SEARCH_TABS メッセージを送信して結果を返す", async () => {
			const mockItems: TabItem[] = [
				{
					id: 1,
					url: "https://example.com",
					title: "Example Tab",
					windowId: 1,
					active: true,
				},
			];
			const mockResponse: SearchTabsResponse = { items: mockItems };

			const listener = (message: Message) => {
				if (message.type === "SEARCH_TABS") {
					return Promise.resolve(mockResponse);
				}
			};
			browser.runtime.onMessage.addListener(listener);
			removeListener = () => browser.runtime.onMessage.removeListener(listener);

			const result = await searchTabs("example");

			expect(result).toEqual(mockResponse);
		});
	});

	describe("switchToTab", () => {
		let removeListener: () => void;

		beforeEach(() => {
			removeListener = () => {};
		});

		afterEach(() => {
			removeListener();
		});

		it("background に SWITCH_TO_TAB メッセージを送信する", async () => {
			let receivedMessage: Message | null = null;

			const listener = (message: Message) => {
				receivedMessage = message;
				return Promise.resolve();
			};
			browser.runtime.onMessage.addListener(listener);
			removeListener = () => browser.runtime.onMessage.removeListener(listener);

			await switchToTab(123);

			expect(receivedMessage).toEqual({
				type: "SWITCH_TO_TAB",
				tabId: 123,
			});
		});
	});
});
