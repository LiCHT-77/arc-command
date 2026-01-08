import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchResultItem } from "@/components/search-result-item";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandList,
} from "@/components/ui/command";
import {
	BookmarkDataSource,
	HistoryDataSource,
	TabDataSource,
} from "@/lib/search/data-sources";
import { deduplicateByUrl } from "@/lib/search/deduplicate-by-url";
import { useSearch } from "@/lib/search/use-search";
import { cn } from "@/lib/utils";

/**
 * 親ウィンドウにメッセージを送信してiframeを閉じる
 */
function notifyClose() {
	window.parent.postMessage({ type: "arc-command:close" }, "*");
}

export default function App() {
	const [query, setQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// DataSourceのインスタンスを作成（メモ化して再作成を防ぐ）
	const bookmarkDataSource = useMemo(() => new BookmarkDataSource(), []);
	const historyDataSource = useMemo(() => new HistoryDataSource(), []);
	const tabDataSource = useMemo(() => new TabDataSource(), []);

	// useSearchフックを使用して検索結果を取得
	const { results } = useSearch(query, [
		tabDataSource,
		bookmarkDataSource,
		historyDataSource,
	]);

	// 同じURLの結果はタブを優先して重複を除去
	const filteredResults = useMemo(() => deduplicateByUrl(results), [results]);

	// Escapeキーで閉じる
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				notifyClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	// focusメッセージを受け取ったらinputにフォーカス
	useEffect(() => {
		const handleMessage = (e: MessageEvent) => {
			if (e.data?.type === "arc-command:focus") {
				inputRef.current?.focus();
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	const handleSelect = useCallback(() => {
		setQuery("");
		notifyClose();
	}, []);

	return (
		<div className="flex min-h-screen items-start justify-center pt-[15vh]">
			{/* オーバーレイ背景 - クリックで閉じる */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: Escapeキーは別途ハンドリング済み */}
			{/* biome-ignore lint/a11y/useSemanticElements: オーバーレイはボタンではない */}
			<div
				role="button"
				tabIndex={-1}
				aria-label="閉じる"
				className="fixed inset-0 z-40 bg-black/50"
				onClick={notifyClose}
			/>

			{/* コマンドパレット */}
			<div
				className={cn(
					"bg-background relative z-50 w-full max-w-lg rounded-lg border shadow-lg",
					"overflow-hidden",
				)}
			>
				<Command
					shouldFilter={false}
					className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
				>
					<CommandInput
						ref={inputRef}
						placeholder="タブ・ブックマーク・履歴を検索..."
						value={query}
						onValueChange={setQuery}
						autoFocus
					/>
					<CommandList className="overscroll-contain">
						<CommandEmpty>結果が見つかりません</CommandEmpty>
						{filteredResults.map((result) => (
							<SearchResultItem
								key={result.id}
								result={result}
								onSelect={handleSelect}
							/>
						))}
					</CommandList>
				</Command>
			</div>
		</div>
	);
}
