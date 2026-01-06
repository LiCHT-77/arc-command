import { CommandItem } from "@/components/ui/command";
import type { SearchResult } from "@/lib/search/types";

interface SearchResultItemProps {
	result: SearchResult;
	onSelect?: () => void;
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

	return (
		<CommandItem value={result.id} onSelect={handleSelect}>
			<div className="flex flex-col gap-1 overflow-hidden">
				<span className="truncate font-medium">{result.title}</span>
				{subtitle && (
					<span className="text-muted-foreground truncate text-xs">
						{subtitle}
					</span>
				)}
			</div>
		</CommandItem>
	);
}
