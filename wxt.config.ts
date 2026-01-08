import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	manifest: {
		permissions: ["history", "tabs", "bookmarks", "scripting"],
		web_accessible_resources: [
			{
				resources: ["command-iframe.html"],
				matches: ["<all_urls>"],
			},
		],
	},
});
