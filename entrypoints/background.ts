import {
	isOpenTabMessage,
	isSearchHistoryMessage,
	isSearchTabsMessage,
	isSwitchToTabMessage,
	type Message,
	type SearchHistoryResponse,
	type SearchTabsResponse,
} from "@/lib/messages";

export default defineBackground(() => {
	console.log("Hello background!", { id: browser.runtime.id });

	browser.runtime.onMessage.addListener(
		(message: Message, _sender, sendResponse) => {
			if (isSearchHistoryMessage(message)) {
				handleSearchHistory(message.query).then(sendResponse);
				return true; // async response
			}

			if (isOpenTabMessage(message)) {
				handleOpenTab(message.url);
				return;
			}

			if (isSearchTabsMessage(message)) {
				handleSearchTabs(message.query).then(sendResponse);
				return true; // async response
			}

			if (isSwitchToTabMessage(message)) {
				handleSwitchToTab(message.tabId);
				return;
			}
		},
	);
});

async function handleSearchHistory(
	query: string,
): Promise<SearchHistoryResponse> {
	const results = await browser.history.search({
		text: query,
		maxResults: 50,
	});

	return {
		items: results.map((item) => ({
			id: item.id,
			url: item.url ?? "",
			title: item.title ?? "",
			lastVisitTime: item.lastVisitTime,
		})),
	};
}

function handleOpenTab(url: string): void {
	browser.tabs.create({ url });
}

async function handleSearchTabs(query: string): Promise<SearchTabsResponse> {
	// 全てのタブを取得
	const tabs = await browser.tabs.query({});

	// クエリが空の場合は全タブを返す
	if (!query.trim()) {
		return {
			items: tabs.map((tab) => ({
				id: tab.id ?? 0,
				url: tab.url ?? "",
				title: tab.title ?? "",
				windowId: tab.windowId ?? 0,
				active: tab.active ?? false,
			})),
		};
	}

	// クエリでフィルタリング（タイトルまたはURLに含まれるもの）
	const queryLower = query.toLowerCase();
	const filtered = tabs.filter((tab) => {
		const title = (tab.title ?? "").toLowerCase();
		const url = (tab.url ?? "").toLowerCase();
		return title.includes(queryLower) || url.includes(queryLower);
	});

	return {
		items: filtered.map((tab) => ({
			id: tab.id ?? 0,
			url: tab.url ?? "",
			title: tab.title ?? "",
			windowId: tab.windowId ?? 0,
			active: tab.active ?? false,
		})),
	};
}

function handleSwitchToTab(tabId: number): void {
	// タブをアクティブにする
	browser.tabs.update(tabId, { active: true });
	// タブが属するウィンドウもフォーカスする
	browser.tabs.get(tabId).then((tab) => {
		if (tab.windowId) {
			browser.windows.update(tab.windowId, { focused: true });
		}
	});
}
