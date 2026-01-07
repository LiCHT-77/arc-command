import { Bookmark, History, Layers } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import type { SearchResult, SearchResultType } from "@/lib/search/types";

interface SearchResultItemProps {
	result: SearchResult;
	onSelect?: () => void;
}

/**
 * 検索結果タイプに応じたアイコンを返す
 */
function getIconForType(type: SearchResultType) {
	switch (type) {
		case "tab":
			return Layers;
		case "history":
			return History;
		case "bookmark":
			return Bookmark;
		default:
			return null;
	}
}

/**
 * 検索結果アイテムを表示するコンポーネント
 */
export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
	const handleSelect = async () => {
		await result.onSelect();
		onSelect?.();
	};

	const subtitle = result.subtitle || result.url;
	const Icon = getIconForType(result.type);

	return (
		<CommandItem value={result.id} onSelect={handleSelect}>
			<div className="flex w-full items-center gap-3">
				{Icon && (
					<Icon className="text-muted-foreground h-4 w-4 flex-shrink-0" />
				)}
				<div className="flex flex-1 flex-col gap-1 overflow-hidden">
					<span className="truncate font-medium">{result.title}</span>
					{subtitle && (
						<span className="text-muted-foreground truncate text-xs">
							{subtitle}
						</span>
					)}
				</div>
				{result.type === "tab" && (
					<span className="text-muted-foreground flex-shrink-0 text-xs">
						Switch Tab →
					</span>
				)}
			</div>
		</CommandItem>
	);
}
