import "./style.css";
import ReactDOM from "react-dom/client";
import { ShadowContainerProvider } from "@/lib/shadow-container-context";
import App from "./App";

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",

	async main(ctx) {
		const ui = await createShadowRootUi(ctx, {
			name: "arc-command-ui",
			position: "overlay",
			zIndex: 2147483647,
			onMount: (container) => {
				// コンテナはポインターイベントを通過させる
				container.style.pointerEvents = "none";

				const wrapper = document.createElement("div");
				wrapper.style.pointerEvents = "auto";
				container.append(wrapper);

				const root = ReactDOM.createRoot(wrapper);
				root.render(
					<ShadowContainerProvider container={wrapper}>
						<App />
					</ShadowContainerProvider>,
				);
				return root;
			},
			onRemove: (root) => {
				root?.unmount();
			},
		});

		ui.mount();
	},
});
