import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Package, ShieldCheck, Users } from "lucide-react";
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
		<div className="mx-auto w-full max-w-5xl space-y-8">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Overview</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Welcome back, {currentUser.name ?? currentUser.email}. Here is what is happening in your
					store.
				</p>
			</div>

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
		<Card>
			<CardContent className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">{title}</p>
					{loading ? (
						<div className="h-8 w-12 animate-pulse rounded-md bg-muted" />
					) : (
						<p className="text-3xl font-bold tracking-tight">{valueText ?? value ?? 0}</p>
					)}
					{error && <p className="text-xs text-destructive">{error}</p>}
				</div>
				<span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
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
		<Card className={cn("transition-colors hover:border-primary/40")}>
			<CardHeader>
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent className="flex items-center justify-between gap-4">
				<p className="text-sm text-muted-foreground">{description}</p>
				<Link
					to={to}
					className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
				>
					Open
					<ArrowRight className="size-4" />
				</Link>
			</CardContent>
		</Card>
	);
}
