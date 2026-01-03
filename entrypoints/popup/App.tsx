import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import { Button } from "@/components/ui/button";
import wxtLogo from "/wxt.svg";

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="min-h-[400px] min-w-[300px] p-6 flex flex-col items-center justify-center gap-4">
			<div className="flex gap-4">
				<a href="https://wxt.dev" target="_blank" rel="noopener">
					<img src={wxtLogo} className="h-16 w-16" alt="WXT logo" />
				</a>
				<a href="https://react.dev" target="_blank" rel="noopener">
					<img src={reactLogo} className="h-16 w-16" alt="React logo" />
				</a>
			</div>
			<h1 className="text-2xl font-bold">WXT + React</h1>
			<div className="flex flex-col items-center gap-4">
				<Button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</Button>
				<div className="flex gap-2">
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="destructive">Destructive</Button>
				</div>
			</div>
			<p className="text-sm text-muted-foreground">
				Click on the WXT and React logos to learn more
			</p>
		</div>
	);
}

export default App;
