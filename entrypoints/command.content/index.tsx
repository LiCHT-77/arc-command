export default defineContentScript({
	matches: ["<all_urls>"],

	async main(ctx) {
		let isVisible = false;

		const ui = await createIframeUi(ctx, {
			page: "/command-iframe.html",
			position: "overlay",
			zIndex: 2147483647,
			onMount: (wrapper, iframe) => {
				// iframeの初期設定
				iframe.style.width = "100%";
				iframe.style.height = "100%";
				iframe.style.border = "none";
				iframe.style.background = "transparent";
				iframe.allow = "clipboard-write";

				// wrapperは初期状態で非表示
				wrapper.style.display = "none";
				wrapper.style.position = "fixed";
				wrapper.style.top = "0";
				wrapper.style.left = "0";
				wrapper.style.width = "100%";
				wrapper.style.height = "100%";
			},
		});

		ui.mount();

		// iframeの表示/非表示を切り替える
		const toggleVisibility = () => {
			const wrapper = ui.wrapper;
			if (!wrapper) return;

			isVisible = !isVisible;
			wrapper.style.display = isVisible ? "block" : "none";

			// 表示時にiframeにフォーカスを移し、inputにフォーカスするようメッセージを送信
			if (isVisible && ui.iframe?.contentWindow) {
				ui.iframe.contentWindow.focus();
				ui.iframe.contentWindow.postMessage(
					{ type: "arc-command:focus" },
					"*",
				);
			}
		};

		// iframeを非表示にする
		const hide = () => {
			const wrapper = ui.wrapper;
			if (!wrapper) return;

			isVisible = false;
			wrapper.style.display = "none";
		};

		// cmd + shift + K でトグル
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "k" && e.metaKey && e.shiftKey) {
				e.preventDefault();
				toggleVisibility();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		// iframeからのメッセージを受け取る
		const handleMessage = (e: MessageEvent) => {
			if (e.data?.type === "arc-command:close") {
				hide();
			}
		};

		window.addEventListener("message", handleMessage);

		// クリーンアップ
		ctx.onInvalidated(() => {
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("message", handleMessage);
		});
	},
});
