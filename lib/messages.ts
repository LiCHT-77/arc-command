// メッセージ型定義

export type SearchHistoryMessage = {
	type: "SEARCH_HISTORY";
	query: string;
};

export type OpenTabMessage = {
	type: "OPEN_TAB";
	url: string;
};

export type Message = SearchHistoryMessage | OpenTabMessage;

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

// 型ガード
export function isSearchHistoryMessage(
	message: Message,
): message is SearchHistoryMessage {
	return message.type === "SEARCH_HISTORY";
}

export function isOpenTabMessage(message: Message): message is OpenTabMessage {
	return message.type === "OPEN_TAB";
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
