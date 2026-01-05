import { useCallback, useEffect, useMemo, useState } from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandList,
} from "@/components/ui/command";
import { SearchResultItem } from "@/components/search-result-item";
import { useSearch } from "@/lib/search/use-search";
import { HistoryDataSource } from "@/lib/search/data-sources";

export default function App() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	// DataSourceのインスタンスを作成（メモ化して再作成を防ぐ）
	const historyDataSource = useMemo(() => new HistoryDataSource(), []);

	// useSearchフックを使用して検索結果を取得
	const { results } = useSearch(query, [historyDataSource]);

	// cmd + shift + K でトグル
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "k" && e.metaKey && e.shiftKey) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleSelect = useCallback(() => {
		setOpen(false);
		setQuery("");
	}, []);

	return (
		<CommandDialog
			className="top-[15%] translate-y-0"
			open={open}
			onOpenChange={setOpen}
			title="履歴検索"
			description="ブラウザの履歴を検索します"
			showCloseButton={false}
		>
			<CommandInput
				placeholder="履歴を検索..."
				value={query}
				onValueChange={setQuery}
			/>
			<CommandList>
				<CommandEmpty>履歴が見つかりません</CommandEmpty>
				{results.map((result) => (
					<SearchResultItem
						key={result.id}
						result={result}
						onSelect={handleSelect}
					/>
				))}
			</CommandList>
		</CommandDialog>
	);
}
