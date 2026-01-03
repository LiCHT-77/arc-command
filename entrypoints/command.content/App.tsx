import { useCallback, useEffect, useState } from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { type HistoryItem, openTab, searchHistory } from "@/lib/messages";

export default function App() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [items, setItems] = useState<HistoryItem[]>([]);

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

	// 検索クエリが変更されたら履歴を検索
	useEffect(() => {
		if (!query) {
			setItems([]);
			return;
		}

		const timeoutId = setTimeout(async () => {
			const result = await searchHistory(query);
			setItems(result.items);
		}, 150); // debounce

		return () => clearTimeout(timeoutId);
	}, [query]);

	const handleSelect = useCallback(async (url: string) => {
		await openTab(url);
		setOpen(false);
		setQuery("");
		setItems([]);
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
				{items.length > 0 && (
					<CommandGroup heading="履歴">
						{items.map((item) => (
							<CommandItem
								key={item.id}
								value={item.url}
								onSelect={() => handleSelect(item.url)}
							>
								<div className="flex flex-col gap-1 overflow-hidden">
									<span className="truncate font-medium">
										{item.title || item.url}
									</span>
									<span className="text-muted-foreground truncate text-xs">
										{item.url}
									</span>
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				)}
			</CommandList>
		</CommandDialog>
	);
}
