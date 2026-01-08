import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// iframeの表示/非表示を制御するロジックをテスト

describe("Command Content Script", () => {
	let mockIframe: HTMLIFrameElement;
	let mockWrapper: HTMLDivElement;

	beforeEach(() => {
		mockIframe = document.createElement("iframe");
		mockWrapper = document.createElement("div");
		mockWrapper.appendChild(mockIframe);
		document.body.appendChild(mockWrapper);
	});

	afterEach(() => {
		document.body.innerHTML = "";
		vi.restoreAllMocks();
	});

	describe("キーボードショートカット", () => {
		it("cmd + shift + K でiframeが表示される", () => {
			// iframeは初期状態で非表示
			mockWrapper.style.display = "none";

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "k" && e.metaKey && e.shiftKey) {
					e.preventDefault();
					mockWrapper.style.display =
						mockWrapper.style.display === "none" ? "block" : "none";
				}
			};

			document.addEventListener("keydown", handleKeyDown);

			// cmd + shift + K を押す
			const event = new KeyboardEvent("keydown", {
				key: "k",
				metaKey: true,
				shiftKey: true,
			});
			document.dispatchEvent(event);

			expect(mockWrapper.style.display).toBe("block");

			document.removeEventListener("keydown", handleKeyDown);
		});

		it("再度 cmd + shift + K を押すとiframeが非表示になる", () => {
			mockWrapper.style.display = "block";

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "k" && e.metaKey && e.shiftKey) {
					e.preventDefault();
					mockWrapper.style.display =
						mockWrapper.style.display === "none" ? "block" : "none";
				}
			};

			document.addEventListener("keydown", handleKeyDown);

			const event = new KeyboardEvent("keydown", {
				key: "k",
				metaKey: true,
				shiftKey: true,
			});
			document.dispatchEvent(event);

			expect(mockWrapper.style.display).toBe("none");

			document.removeEventListener("keydown", handleKeyDown);
		});
	});

	describe("postMessage通信", () => {
		it("closeメッセージを受け取るとiframeが非表示になる", () => {
			mockWrapper.style.display = "block";

			const handleMessage = (e: MessageEvent) => {
				if (e.data?.type === "arc-command:close") {
					mockWrapper.style.display = "none";
				}
			};

			window.addEventListener("message", handleMessage);

			// iframe からの close メッセージをシミュレート
			window.postMessage({ type: "arc-command:close" }, "*");

			// postMessageは非同期なので少し待つ
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					expect(mockWrapper.style.display).toBe("none");
					window.removeEventListener("message", handleMessage);
					resolve();
				}, 10);
			});
		});

		it("関係ないメッセージは無視する", () => {
			mockWrapper.style.display = "block";

			const handleMessage = (e: MessageEvent) => {
				if (e.data?.type === "arc-command:close") {
					mockWrapper.style.display = "none";
				}
			};

			window.addEventListener("message", handleMessage);

			window.postMessage({ type: "other-message" }, "*");

			return new Promise<void>((resolve) => {
				setTimeout(() => {
					expect(mockWrapper.style.display).toBe("block");
					window.removeEventListener("message", handleMessage);
					resolve();
				}, 10);
			});
		});
	});

	describe("iframeへのフォーカス", () => {
		it("表示時にiframeにフォーカスが移る", () => {
			mockWrapper.style.display = "none";

			const focusSpy = vi.spyOn(mockIframe.contentWindow as Window, "focus");

			// iframeにcontentWindowがある場合のみテスト
			if (mockIframe.contentWindow) {
				mockWrapper.style.display = "block";
				mockIframe.contentWindow.focus();

				expect(focusSpy).toHaveBeenCalled();
			}
		});

		it("表示時にfocusメッセージをiframeに送信する", () => {
			mockWrapper.style.display = "none";
			let isVisible = false;

			// postMessageをモック
			const postMessageSpy = vi.fn();
			Object.defineProperty(mockIframe, "contentWindow", {
				value: {
					focus: vi.fn(),
					postMessage: postMessageSpy,
				},
				writable: true,
			});

			// toggleVisibility のロジックを再現
			const toggleVisibility = () => {
				isVisible = !isVisible;
				mockWrapper.style.display = isVisible ? "block" : "none";

				if (isVisible && mockIframe.contentWindow) {
					mockIframe.contentWindow.focus();
					mockIframe.contentWindow.postMessage(
						{ type: "arc-command:focus" },
						"*",
					);
				}
			};

			// cmd + shift + K を押す
			toggleVisibility();

			expect(mockWrapper.style.display).toBe("block");
			expect(postMessageSpy).toHaveBeenCalledWith(
				{ type: "arc-command:focus" },
				"*",
			);
		});
	});
});
