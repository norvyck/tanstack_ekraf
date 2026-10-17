import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import BetterAuthHeader from "../integrations/better-auth/header-user.tsx";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
			<nav className="page-wrap flex items-center gap-3 py-3 sm:py-4">
				<Link
					to="/"
					className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5 sm:px-4 sm:py-2"
				>
					<span className="grid size-5 place-items-center rounded-md bg-[var(--lagoon-deep)] text-white">
						<ShoppingBag className="size-3" />
					</span>
					Ekraf Dashboard
				</Link>

				<div className="ml-2 hidden items-center gap-4 text-sm font-semibold sm:flex">
					<Link to="/" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
						Home
					</Link>
					<Link
						to="/dashboard"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						Dashboard
					</Link>
				</div>

				<div className="ml-auto flex items-center gap-2">
					<ThemeToggle />
					<BetterAuthHeader />
				</div>
			</nav>
		</header>
	);
}
