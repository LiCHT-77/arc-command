import { describe, expect, it } from "vitest";
import { isSearchEngineUrl } from "./is-search-engine-url";

describe("isSearchEngineUrl", () => {
	describe("Google検索", () => {
		it("google.com/search はtrueを返す", () => {
			expect(isSearchEngineUrl("https://www.google.com/search?q=test")).toBe(
				true,
			);
		});

		it("google.co.jp/search はtrueを返す", () => {
			expect(
				isSearchEngineUrl("https://www.google.co.jp/search?q=テスト"),
			).toBe(true);
		});

		it("www無しのgoogle.com/search はtrueを返す", () => {
			expect(isSearchEngineUrl("https://google.com/search?q=test")).toBe(true);
		});

		it("Googleのトップページはfalseを返す", () => {
			expect(isSearchEngineUrl("https://www.google.com/")).toBe(false);
		});
	});

	describe("Bing検索", () => {
		it("bing.com/search はtrueを返す", () => {
			expect(isSearchEngineUrl("https://www.bing.com/search?q=test")).toBe(
				true,
			);
		});

		it("www無しのbing.com/search はtrueを返す", () => {
			expect(isSearchEngineUrl("https://bing.com/search?q=test")).toBe(true);
		});

		it("Bingのトップページはfalseを返す", () => {
			expect(isSearchEngineUrl("https://www.bing.com/")).toBe(false);
		});
	});

	describe("Yahoo検索", () => {
		it("search.yahoo.com はtrueを返す", () => {
			expect(isSearchEngineUrl("https://search.yahoo.com/search?p=test")).toBe(
				true,
			);
		});

		it("search.yahoo.co.jp はtrueを返す", () => {
			expect(
				isSearchEngineUrl("https://search.yahoo.co.jp/search?p=テスト"),
			).toBe(true);
		});

		it("Yahoo!のトップページはfalseを返す", () => {
			expect(isSearchEngineUrl("https://www.yahoo.com/")).toBe(false);
		});
	});

	describe("DuckDuckGo検索", () => {
		it("duckduckgo.com/?q= はtrueを返す", () => {
			expect(isSearchEngineUrl("https://duckduckgo.com/?q=test")).toBe(true);
		});

		it("www付きのduckduckgo.com/?q= はtrueを返す", () => {
			expect(isSearchEngineUrl("https://www.duckduckgo.com/?q=test")).toBe(
				true,
			);
		});

		it("DuckDuckGoのトップページはfalseを返す", () => {
			expect(isSearchEngineUrl("https://duckduckgo.com/")).toBe(false);
		});
	});

	describe("Baidu検索", () => {
		it("baidu.com/s はtrueを返す", () => {
			expect(isSearchEngineUrl("https://www.baidu.com/s?wd=test")).toBe(true);
		});

		it("www無しのbaidu.com/s はtrueを返す", () => {
			expect(isSearchEngineUrl("https://baidu.com/s?wd=test")).toBe(true);
		});

		it("Baiduのトップページはfalseを返す", () => {
			expect(isSearchEngineUrl("https://www.baidu.com/")).toBe(false);
		});
	});

	describe("通常のURL", () => {
		it("一般的なWebサイトはfalseを返す", () => {
			expect(isSearchEngineUrl("https://example.com")).toBe(false);
		});

		it("GitHubはfalseを返す", () => {
			expect(isSearchEngineUrl("https://github.com/user/repo")).toBe(false);
		});
	});
});
