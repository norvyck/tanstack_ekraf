import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	HeadContent,
	Link,
	Scripts,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Ekraf Dashboard",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});

function NotFound() {
	return (
		<main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
			<Card className="w-full max-w-md shadow-lg">
				<CardContent className="space-y-4 py-10 text-center">
					<p className="text-sm font-semibold text-muted-foreground">404</p>
					<h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
					<p className="text-sm text-muted-foreground">
						The page you are looking for does not exist or has been moved.
					</p>
					<Button asChild>
						<Link to="/">Back to home</Link>
					</Button>
				</CardContent>
			</Card>
		</main>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	// The admin area renders its own sidebar shell, so the global
	// header/footer are hidden there.
	const isAdminRoute = useRouterState({
		select: (state) => state.matches.some((match) => match.routeId.startsWith("/_admin")),
	});

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, trusted theme init script */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
				{!isAdminRoute && <Header />}
				{children}
				{!isAdminRoute && <Footer />}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
