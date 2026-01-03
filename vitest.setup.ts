import "@testing-library/jest-dom/vitest";

// ResizeObserver mock for jsdom
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};
