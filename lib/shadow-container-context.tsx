import { createContext, type ReactNode, useContext } from "react";

const ShadowContainerContext = createContext<HTMLElement | null>(null);

export function ShadowContainerProvider({
	container,
	children,
}: {
	container: HTMLElement | null;
	children: ReactNode;
}) {
	return (
		<ShadowContainerContext.Provider value={container}>
			{children}
		</ShadowContainerContext.Provider>
	);
}

export function useShadowContainer() {
	return useContext(ShadowContainerContext);
}
