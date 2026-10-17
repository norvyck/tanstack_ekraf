import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	LifeBuoy,
	LogOut,
	type LucideIcon,
	Menu,
	Package,
	ShoppingBag,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/db";
import { cn } from "cn";
import { authClient } from "#/lib/auth-client";
import ThemeToggle from "../ThemeToggle";

type NavItem = {
	label: string;
	to: string;
	icon: LucideIcon;
	adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
	{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
	{ label: "Products", to: "/products", icon: Package },
	{ label: "Users", to: "/users", icon: Users, adminOnly: true },
];

function titleForPath(pathname: string): string {
	if (pathname.startsWith("/products")) return "Products";
	if (pathname.startsWith("/users")) return "Users";
	if (pathname.startsWith("/dashboard")) return "Dashboard";
	return "Admin";
}

export function AdminShell({
	role,
	email,
	name,
	children,
}: {
	role: Role;
	email: string;
	name: string;
	children: React.ReactNode;
}) {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");

	const handleSignOut = async () => {
		await authClient.signOut();
		await navigate({ to: "/login" });
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--hero-a),transparent_42%),linear-gradient(145deg,var(--foam),var(--bg-base))] text-foreground lg:flex">
			{mobileOpen && (
				<button
					type="button"
					aria-label="Close navigation"
					onClick={() => setMobileOpen(false)}
					className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
				/>
			)}

			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--line)] bg-[linear-gradient(180deg,var(--surface-strong),var(--surface))] shadow-[18px_0_50px_rgba(23,58,64,0.08)] backdrop-blur-xl transition-[width,transform] duration-200 lg:static lg:translate-x-0 lg:shadow-none",
					mobileOpen ? "translate-x-0" : "-translate-x-full",
					collapsed ? "lg:w-[4.5rem]" : "lg:w-64",
				)}
			>
				<div className="flex h-20 shrink-0 items-center gap-3 border-b border-[var(--line)] px-5">
					<span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(145deg,var(--lagoon),var(--palm))] text-white shadow-[0_8px_22px_rgba(47,106,74,0.22)]">
						<ShoppingBag className="size-4" />
					</span>
					<span className={cn("min-w-0", collapsed && "lg:hidden")}>
						<span className="block truncate text-sm font-extrabold tracking-tight">
							Ekraf Studio
						</span>
						<span className="mt-0.5 block text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
							Workspace
						</span>
					</span>
					<button
						type="button"
						aria-label="Close navigation"
						onClick={() => setMobileOpen(false)}
						className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent lg:hidden"
					>
						<X className="size-4" />
					</button>
				</div>

				<div className="px-5 pt-7 pb-2 text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase lg:px-4">
					<span className={cn(collapsed && "lg:hidden")}>Workspace</span>
				</div>
				<nav className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
					{visibleItems.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							title={collapsed ? item.label : undefined}
							onClick={() => setMobileOpen(false)}
							className={cn(
								"relative flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold text-muted-foreground transition-all hover:bg-[color-mix(in_oklab,var(--lagoon)_10%,transparent)] hover:text-foreground",
								collapsed && "lg:justify-center lg:px-0",
							)}
							activeProps={{
								className:
									"bg-[color-mix(in_oklab,var(--lagoon)_14%,transparent)] text-[var(--sea-ink)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--lagoon)_22%,transparent)] before:absolute before:top-2.5 before:bottom-2.5 before:left-0 before:w-1 before:rounded-full before:bg-[var(--lagoon-deep)]",
							}}
						>
							<item.icon className="size-4 shrink-0" />
							<span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
						</Link>
					))}
				</nav>

				<div className="hidden border-t border-[var(--line)] p-3 lg:block">
					<button
						type="button"
						onClick={() => setCollapsed((value) => !value)}
						className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
					>
						{collapsed ? (
							<ChevronRight className="size-4" />
						) : (
							<>
								<ChevronLeft className="size-4" />
								<span>Collapse</span>
							</>
						)}
					</button>
				</div>
			</aside>

			<div className="flex min-h-screen min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-30 flex h-[4.5rem] items-center gap-3 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--header-bg)_88%,transparent)] px-4 backdrop-blur-xl sm:px-7">
					<button
						type="button"
						aria-label="Open navigation"
						onClick={() => setMobileOpen(true)}
						className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground lg:hidden"
					>
						<Menu className="size-5" />
					</button>

					<div className="min-w-0">
						<p className="text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
							Ekraf admin
						</p>
						<p className="truncate text-sm font-extrabold tracking-tight">
							{titleForPath(pathname)}
						</p>
					</div>

					<div className="ml-auto flex items-center gap-2 sm:gap-3">
						<div className="hidden items-center gap-2.5 border-r border-[var(--line)] pr-3 text-right sm:flex">
							<span className="grid size-8 place-items-center rounded-full bg-[color-mix(in_oklab,var(--lagoon)_18%,var(--surface-strong))] text-xs font-extrabold text-[var(--sea-ink)]">
								{name.slice(0, 1).toUpperCase()}
							</span>
							<span className="min-w-0">
								<span className="block max-w-[12rem] truncate text-xs font-bold">{name}</span>
								<span className="mt-0.5 block max-w-[12rem] truncate text-[10px] text-muted-foreground">
									{role === "admin" ? "Administrator" : "Member"}
								</span>
							</span>
						</div>
						<ThemeToggle />
						<Button
							className="rounded-xl border-[var(--line)] bg-[var(--surface)]"
							variant="outline"
							size="sm"
							onClick={handleSignOut}
						>
							<LogOut className="size-4" />
							<span className="hidden sm:inline">Sign out</span>
						</Button>
					</div>
				</header>

				<div className="hidden items-center justify-end gap-1 px-8 pt-5 text-[11px] text-muted-foreground lg:flex">
					<LifeBuoy className="size-3.5" />
					<span>{email}</span>
				</div>
				<main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
			</div>
		</div>
	);
}
