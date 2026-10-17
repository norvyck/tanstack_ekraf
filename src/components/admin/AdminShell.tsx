import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
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
		<div className="min-h-screen bg-background text-foreground lg:flex">
			{mobileOpen && (
				<button
					type="button"
					aria-label="Close navigation"
					onClick={() => setMobileOpen(false)}
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
				/>
			)}

			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-[width,transform] duration-200 lg:static lg:translate-x-0",
					mobileOpen ? "translate-x-0" : "-translate-x-full",
					collapsed ? "lg:w-[4.5rem]" : "lg:w-64",
				)}
			>
				<div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
					<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
						<ShoppingBag className="size-4" />
					</span>
					<span className={cn("truncate font-semibold tracking-tight", collapsed && "lg:hidden")}>
						Ekraf Admin
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

				<nav className="flex-1 space-y-1 overflow-y-auto p-2">
					{visibleItems.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							title={collapsed ? item.label : undefined}
							onClick={() => setMobileOpen(false)}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
								collapsed && "lg:justify-center lg:px-0",
							)}
							activeProps={{ className: "bg-primary/10 text-primary hover:text-primary" }}
						>
							<item.icon className="size-4 shrink-0" />
							<span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
						</Link>
					))}
				</nav>

				<div className="hidden border-t border-border p-2 lg:block">
					<button
						type="button"
						onClick={() => setCollapsed((value) => !value)}
						className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
				<header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
					<button
						type="button"
						aria-label="Open navigation"
						onClick={() => setMobileOpen(true)}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
					>
						<Menu className="size-5" />
					</button>

					<div className="min-w-0">
						<p className="truncate text-sm font-semibold tracking-tight">
							{titleForPath(pathname)}
						</p>
					</div>

					<div className="ml-auto flex items-center gap-2 sm:gap-3">
						<div className="hidden text-right sm:block">
							<p className="max-w-[12rem] truncate text-xs font-medium">{name}</p>
							<p className="max-w-[12rem] truncate text-[11px] text-muted-foreground">
								{email} · {role}
							</p>
						</div>
						<ThemeToggle />
						<Button variant="outline" size="sm" onClick={handleSignOut}>
							<LogOut className="size-4" />
							<span className="hidden sm:inline">Sign out</span>
						</Button>
					</div>
				</header>

				<main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
			</div>
		</div>
	);
}
