import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Package, ShieldCheck, ShoppingBag, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const { data: session, isPending } = authClient.useSession();

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-16 sm:py-24">
			<section className="text-center">
				<span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
					<ShoppingBag className="size-3.5" />
					Ekraf Dashboard
				</span>
				<h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
					Run your store with confidence
				</h1>
				<p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
					A secure admin dashboard for managing products and users, built with TanStack Start and
					Better Auth.
				</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					{isPending ? null : session?.user ? (
						<>
							<Button asChild size="lg">
								<Link to="/dashboard">
									Open dashboard
									<ArrowRight className="size-4" />
								</Link>
							</Button>
							<p className="w-full text-sm text-muted-foreground">
								Signed in as{" "}
								<span className="font-semibold text-foreground">{session.user.email}</span>
							</p>
						</>
					) : (
						<>
							<Button asChild size="lg">
								<Link to="/login">
									Sign in
									<ArrowRight className="size-4" />
								</Link>
							</Button>
							<Button asChild size="lg" variant="outline">
								<Link to="/setup">Seed admin account</Link>
							</Button>
						</>
					)}
				</div>
			</section>

			<section className="mt-16 grid gap-4 sm:grid-cols-3">
				<FeatureCard
					icon={Package}
					title="Products"
					description="Create, edit, and organize your catalog with image support."
				/>
				<FeatureCard
					icon={Users}
					title="Users"
					description="Manage accounts and administrator access in one place."
				/>
				<FeatureCard
					icon={ShieldCheck}
					title="Secure by default"
					description="Server-side authorization and validation on every write."
				/>
			</section>
		</main>
	);
}

function FeatureCard({
	icon: Icon,
	title,
	description,
}: {
	icon: typeof Package;
	title: string;
	description: string;
}) {
	return (
		<Card>
			<CardContent className="space-y-3">
				<span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
					<Icon className="size-5" />
				</span>
				<div className="space-y-1">
					<p className="font-semibold">{title}</p>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</CardContent>
		</Card>
	);
}
