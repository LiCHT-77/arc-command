import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchResultItem } from "@/components/search-result-item";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandList,
} from "@/components/ui/command";
import { HistoryDataSource, TabDataSource } from "@/lib/search/data-sources";
import { deduplicateByUrl } from "@/lib/search/deduplicate-by-url";
import { useSearch } from "@/lib/search/use-search";
import { useShadowContainer } from "@/lib/shadow-container-context";
import { cn } from "@/lib/utils";

export default function App() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const shadowContainer = useShadowContainer();

	// DataSourceのインスタンスを作成（メモ化して再作成を防ぐ）
	const historyDataSource = useMemo(() => new HistoryDataSource(), []);
	const tabDataSource = useMemo(() => new TabDataSource(), []);

	// useSearchフックを使用して検索結果を取得
	const { results } = useSearch(query, [tabDataSource, historyDataSource]);

	// 同じURLの結果はタブを優先して重複を除去
	const filteredResults = useMemo(() => deduplicateByUrl(results), [results]);

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

	// ダイアログ表示中は Shadow UI コンテナでポインターイベントを受け取れるようにする。
	// （閉じている時はページ操作を邪魔しないために通過させる）
	useEffect(() => {
		const host = shadowContainer?.parentElement;
		if (!host) return;

		host.style.pointerEvents = open ? "auto" : "none";
		return () => {
			host.style.pointerEvents = "none";
		};
	}, [open, shadowContainer]);

	const handleSelect = useCallback(() => {
		setOpen(false);
		setQuery("");
	}, []);

	return (
		<DialogPrimitive.Root open={open} onOpenChange={setOpen}>
			<DialogPrimitive.Portal container={shadowContainer ?? undefined}>
				{/* Shadow DOM + Radix Dialog の組み合わせで react-remove-scroll がホイールイベントを
				    誤ってブロックするため、Radix の DialogOverlay（RemoveScroll 内包）ではなく
				    素の div でオーバーレイを描画する */}
				<div
					data-state={open ? "open" : "closed"}
					aria-hidden="true"
					className={cn(
						"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
					)}
				/>
				<DialogPrimitive.Content
					className={cn(
						"bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[15%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] gap-4 rounded-lg border shadow-lg duration-200 outline-none sm:max-w-lg",
						"overflow-hidden p-0",
					)}
				>
					<DialogPrimitive.Title className="sr-only">
						検索
					</DialogPrimitive.Title>
					<DialogPrimitive.Description className="sr-only">
						タブと履歴を検索します
					</DialogPrimitive.Description>
					<Command
						shouldFilter={false}
						className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
					>
						<CommandInput
							placeholder="タブ・履歴を検索..."
							value={query}
							onValueChange={setQuery}
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
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
