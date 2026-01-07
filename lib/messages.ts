// メッセージ型定義

export type SearchHistoryMessage = {
	type: "SEARCH_HISTORY";
	query: string;
};

export type OpenTabMessage = {
	type: "OPEN_TAB";
	url: string;
};

export type SearchTabsMessage = {
	type: "SEARCH_TABS";
	query: string;
};

export type SwitchToTabMessage = {
	type: "SWITCH_TO_TAB";
	tabId: number;
};

export type SearchBookmarksMessage = {
	type: "SEARCH_BOOKMARKS";
	query: string;
};

export type Message =
	| SearchHistoryMessage
	| OpenTabMessage
	| SearchTabsMessage
	| SwitchToTabMessage
	| SearchBookmarksMessage;

// 履歴アイテム型
export type HistoryItem = {
	id: string;
	url: string;
	title: string;
	lastVisitTime?: number;
};

export type SearchHistoryResponse = {
	items: HistoryItem[];
};

// タブアイテム型
export type TabItem = {
	id: number;
	url: string;
	title: string;
	windowId: number;
	active: boolean;
	pinned: boolean;
};

export type SearchTabsResponse = {
	items: TabItem[];
};

// ブックマークアイテム型
export type BookmarkItem = {
	id: string;
	url: string;
	title: string;
};

export type SearchBookmarksResponse = {
	items: BookmarkItem[];
};

// メッセージ作成ユーティリティ
export function createSearchHistoryMessage(
	query: string,
): SearchHistoryMessage {
	return {
		type: "SEARCH_HISTORY",
		query,
	};
}

export function createOpenTabMessage(url: string): OpenTabMessage {
	return {
		type: "OPEN_TAB",
		url,
	};
}

export function createSearchTabsMessage(query: string): SearchTabsMessage {
	return {
		type: "SEARCH_TABS",
		query,
	};
}

export function createSwitchToTabMessage(tabId: number): SwitchToTabMessage {
	return {
		type: "SWITCH_TO_TAB",
		tabId,
	};
}

export function createSearchBookmarksMessage(
	query: string,
): SearchBookmarksMessage {
	return {
		type: "SEARCH_BOOKMARKS",
		query,
	};
}

// 型ガード
export function isSearchHistoryMessage(
	message: Message,
): message is SearchHistoryMessage {
	return message.type === "SEARCH_HISTORY";
}

export function isOpenTabMessage(message: Message): message is OpenTabMessage {
	return message.type === "OPEN_TAB";
}

export function isSearchTabsMessage(
	message: Message,
): message is SearchTabsMessage {
	return message.type === "SEARCH_TABS";
}

export function isSwitchToTabMessage(
	message: Message,
): message is SwitchToTabMessage {
	return message.type === "SWITCH_TO_TAB";
}

export function isSearchBookmarksMessage(
	message: Message,
): message is SearchBookmarksMessage {
	return message.type === "SEARCH_BOOKMARKS";
}

// Content Script から Background への通信ユーティリティ
export async function searchHistory(
	query: string,
): Promise<SearchHistoryResponse> {
	return browser.runtime.sendMessage(createSearchHistoryMessage(query));
}

export async function openTab(url: string): Promise<void> {
	await browser.runtime.sendMessage(createOpenTabMessage(url));
}

export async function searchTabs(query: string): Promise<SearchTabsResponse> {
	return browser.runtime.sendMessage(createSearchTabsMessage(query));
}

export async function switchToTab(tabId: number): Promise<void> {
	await browser.runtime.sendMessage(createSwitchToTabMessage(tabId));
}

export async function searchBookmarks(
	query: string,
): Promise<SearchBookmarksResponse> {
	return browser.runtime.sendMessage(createSearchBookmarksMessage(query));
}
