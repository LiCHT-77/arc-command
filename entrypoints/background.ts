import {
	isOpenTabMessage,
	isSearchHistoryMessage,
	type Message,
	type SearchHistoryResponse,
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
