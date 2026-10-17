import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Package, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProducts } from "@/lib/server/products";
import { getUsers } from "@/lib/server/users";
import { cn } from "cn";

export const Route = createFileRoute("/_admin/dashboard")({ component: Dashboard });

function Dashboard() {
	const { role, currentUser } = Route.useRouteContext();
	const isAdmin = role === "admin";

	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: () => getProducts(),
	});
	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: () => getUsers(),
		enabled: isAdmin,
	});

	const products = productsQuery.data ?? [];
	const users = usersQuery.data ?? [];
	const adminCount = users.filter((user) => user.role === "admin").length;

	return (
		<div className="mx-auto w-full max-w-6xl space-y-8">
			<section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[linear-gradient(115deg,color-mix(in_oklab,var(--surface-strong)_96%,white),color-mix(in_oklab,var(--lagoon)_12%,var(--foam)))] px-6 py-7 shadow-[0_20px_55px_rgba(23,58,64,0.08)] sm:px-9 sm:py-9">
				<div className="absolute -top-20 right-8 size-56 rounded-full bg-[var(--hero-a)] blur-3xl" />
				<div className="relative flex flex-wrap items-end justify-between gap-6">
					<div>
						<p className="island-kicker">Your workspace</p>
						<h1 className="display-title mt-2 text-4xl leading-tight font-medium tracking-tight text-[var(--sea-ink)] sm:text-5xl">
							Good to see you, {currentUser.name?.split(" ")[0] ?? "there"}.
						</h1>
						<p className="mt-3 max-w-xl text-sm leading-6 text-[var(--sea-ink-soft)]">
							Here’s a little snapshot of your store. Take a breath, then make something happen.
						</p>
					</div>
					<div className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--surface-strong)] px-3 py-2 text-xs font-bold text-[var(--sea-ink)] shadow-sm">
						<Sparkles className="size-3.5 text-[var(--palm)]" />
						{isAdmin ? "Admin workspace" : "Member workspace"}
					</div>
				</div>
			</section>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<StatCard
					title="Products"
					icon={Package}
					value={products.length}
					loading={productsQuery.isPending}
					error={productsQuery.isError ? (productsQuery.error as Error).message : null}
				/>
				{isAdmin ? (
					<>
						<StatCard
							title="Users"
							icon={Users}
							value={users.length}
							loading={usersQuery.isPending}
							error={usersQuery.isError ? (usersQuery.error as Error).message : null}
						/>
						<StatCard
							title="Administrators"
							icon={ShieldCheck}
							value={adminCount}
							loading={usersQuery.isPending}
							error={null}
						/>
					</>
				) : (
					<StatCard
						title="Your role"
						icon={ShieldCheck}
						valueText="User"
						loading={false}
						error={null}
					/>
				)}
			</div>

			<div className="flex items-center justify-between">
				<div>
					<p className="island-kicker">Quick access</p>
					<h2 className="mt-1 text-xl font-extrabold tracking-tight text-[var(--sea-ink)]">
						Pick up where you left off
					</h2>
				</div>
				<ArrowUpRight className="hidden size-5 text-[var(--lagoon-deep)] sm:block" />
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				<QuickLinkCard
					to="/products"
					title="Products"
					description="Browse, add, edit, and remove items from the catalog."
				/>
				{isAdmin && (
					<QuickLinkCard
						to="/users"
						title="Users"
						description="Manage accounts and promote members to administrators."
					/>
				)}
			</div>
		</div>
	);
}

function StatCard({
	title,
	value,
	valueText,
	icon: Icon,
	loading,
	error,
}: {
	title: string;
	value?: number;
	valueText?: string;
	icon: LucideIcon;
	loading: boolean;
	error: string | null;
}) {
	return (
		<Card className="group relative overflow-hidden rounded-2xl border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_12px_32px_rgba(23,58,64,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(23,58,64,0.12)] sm:p-6">
			<div className="absolute -right-8 -bottom-10 size-32 rounded-full bg-[var(--hero-a)] opacity-50 blur-2xl transition-transform group-hover:scale-125" />
			<CardContent className="relative flex items-start justify-between gap-4 p-0">
				<div className="space-y-1">
					<p className="text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
						{title}
					</p>
					{loading ? (
						<div className="h-8 w-12 animate-pulse rounded-md bg-muted" />
					) : (
						<p className="pt-1 text-4xl font-extrabold tracking-[-0.05em] text-[var(--sea-ink)]">
							{valueText ?? value ?? 0}
						</p>
					)}
					{error && <p className="text-xs text-destructive">{error}</p>}
				</div>
				<span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--lagoon)_16%,var(--surface-strong))] text-[var(--palm)]">
					<Icon className="size-5" />
				</span>
			</CardContent>
		</Card>
	);
}

function QuickLinkCard({
	to,
	title,
	description,
}: {
	to: string;
	title: string;
	description: string;
}) {
	return (
		<Card
			className={cn(
				"group rounded-2xl border-[var(--line)] bg-[var(--surface)] p-0 shadow-[0_12px_32px_rgba(23,58,64,0.06)] transition-all hover:-translate-y-1 hover:border-[var(--chip-line)] hover:shadow-[0_20px_42px_rgba(23,58,64,0.12)]",
			)}
		>
			<CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
				<CardTitle className="text-base font-extrabold tracking-tight text-[var(--sea-ink)]">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex items-center justify-between gap-4 px-5 pb-5 sm:px-6 sm:pb-6">
				<p className="text-sm text-muted-foreground">{description}</p>
				<Link
					to={to}
					className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--lagoon)_12%,var(--surface-strong))] px-3 py-2 text-xs font-bold text-[var(--sea-ink)] no-underline transition group-hover:bg-[var(--palm)] group-hover:text-white"
				>
					Open
					<ArrowRight className="size-4" />
				</Link>
			</CardContent>
		</Card>
	);
}
