// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleSwitchToTab } from "@/entrypoints/background";

describe("background", () => {
	describe("handleSwitchToTab", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("タブをアクティブにする", async () => {
			const tabId = 123;
			const windowId = 456;

			vi.spyOn(browser.tabs, "get").mockResolvedValue({
				id: tabId,
				windowId,
				index: 0,
				highlighted: false,
				active: false,
				pinned: false,
				incognito: false,
			});

			const updateSpy = vi.spyOn(browser.tabs, "update").mockResolvedValue({
				id: tabId,
				windowId,
				index: 0,
				highlighted: false,
				active: true,
				pinned: false,
				incognito: false,
			});

			vi.spyOn(browser.windows, "update").mockResolvedValue({
				id: windowId,
				focused: true,
				alwaysOnTop: false,
				incognito: false,
			});

			vi.spyOn(browser.scripting, "executeScript").mockResolvedValue([]);

			await handleSwitchToTab(tabId);

			expect(updateSpy).toHaveBeenCalledWith(tabId, { active: true });
		});

		it("ウィンドウをフォーカスする", async () => {
			const tabId = 123;
			const windowId = 456;

			vi.spyOn(browser.tabs, "get").mockResolvedValue({
				id: tabId,
				windowId,
				index: 0,
				highlighted: false,
				active: false,
				pinned: false,
				incognito: false,
			});

			vi.spyOn(browser.tabs, "update").mockResolvedValue({
				id: tabId,
				windowId,
				index: 0,
				highlighted: false,
				active: true,
				pinned: false,
				incognito: false,
			});

			const windowsUpdateSpy = vi
				.spyOn(browser.windows, "update")
				.mockResolvedValue({
					id: windowId,
					focused: true,
					alwaysOnTop: false,
					incognito: false,
				});

			vi.spyOn(browser.scripting, "executeScript").mockResolvedValue([]);

			await handleSwitchToTab(tabId);

			expect(windowsUpdateSpy).toHaveBeenCalledWith(windowId, { focused: true });
		});

		it("scripting.executeScript を呼んでページにフォーカスを当てる", async () => {
			const tabId = 123;
			const windowId = 456;

			vi.spyOn(browser.tabs, "get").mockResolvedValue({
				id: tabId,
				windowId,
				index: 0,
				highlighted: false,
				active: false,
				pinned: false,
				incognito: false,
			});

			vi.spyOn(browser.tabs, "update").mockResolvedValue({
				id: tabId,
				windowId,
				index: 0,
				highlighted: false,
				active: true,
				pinned: false,
				incognito: false,
			});

			vi.spyOn(browser.windows, "update").mockResolvedValue({
				id: windowId,
				focused: true,
				alwaysOnTop: false,
				incognito: false,
			});

			const executeScriptSpy = vi
				.spyOn(browser.scripting, "executeScript")
				.mockResolvedValue([]);

			await handleSwitchToTab(tabId);

			expect(executeScriptSpy).toHaveBeenCalledWith({
				target: { tabId },
				func: expect.any(Function),
			});
		});
	});
});
