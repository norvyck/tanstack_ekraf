import { Link, createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	ArrowUpRight,
	Check,
	Leaf,
	Package,
	ShieldCheck,
	ShoppingBag,
	Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const { data: session, isPending } = authClient.useSession();

	return (
		<main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
			<section className="relative isolate overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(125deg,color-mix(in_oklab,var(--surface-strong)_96%,white),color-mix(in_oklab,var(--lagoon)_13%,var(--foam)))] px-6 py-12 shadow-[0_30px_90px_rgba(23,58,64,0.12)] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
				<div className="absolute -top-24 -right-20 -z-10 size-80 rounded-full bg-[var(--hero-a)] blur-3xl" />
				<div className="absolute -right-10 bottom-0 -z-10 hidden h-full w-[42%] lg:block">
					<div className="absolute top-[18%] right-[20%] size-56 rounded-[2.5rem] border border-white/20 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--lagoon)_62%,transparent),color-mix(in_oklab,var(--palm)_74%,transparent))] shadow-[0_35px_90px_rgba(23,58,64,0.24)] rotate-12" />
					<div className="absolute top-[30%] right-[31%] grid size-36 place-items-center rounded-[2rem] border border-white/30 bg-[linear-gradient(145deg,var(--foam),color-mix(in_oklab,var(--sand)_84%,white))] text-[var(--palm)] shadow-2xl -rotate-6">
						<Leaf className="size-16" strokeWidth={1.25} />
					</div>
					<div className="absolute right-[10%] bottom-[16%] rounded-2xl border border-white/50 bg-[var(--surface-strong)] px-4 py-3 shadow-xl backdrop-blur">
						<p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
							Made for makers
						</p>
						<p className="mt-1 text-sm font-extrabold text-[var(--sea-ink)]">
							Grow with intention.
						</p>
					</div>
				</div>

				<div className="max-w-2xl rise-in">
					<span className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3.5 py-2 text-xs font-bold text-[var(--sea-ink)] shadow-sm">
						<span className="grid size-5 place-items-center rounded-full bg-[var(--palm)] text-white">
							<ShoppingBag className="size-3" />
						</span>
						Your creative commerce workspace
					</span>
					<h1 className="display-title mt-7 max-w-xl text-5xl leading-[1.04] font-medium tracking-[-0.045em] text-[var(--sea-ink)] sm:text-6xl lg:text-7xl">
						Make room for <span className="text-[var(--lagoon-deep)] italic">good things.</span>
					</h1>
					<p className="mt-6 max-w-lg text-base leading-7 text-[var(--sea-ink-soft)] sm:text-lg sm:leading-8">
						A calm, considered space to care for your products, your people, and the details that
						make your store yours.
					</p>

					<div className="mt-8 flex flex-wrap items-center gap-3">
						{isPending ? null : session?.user ? (
							<Button
								asChild
								size="lg"
								className="h-12 rounded-xl bg-[var(--palm)] px-6 text-white shadow-[0_12px_26px_rgba(47,106,74,0.24)] hover:bg-[var(--lagoon-deep)]"
							>
								<Link to="/dashboard">
									Open your workspace
									<ArrowUpRight className="size-4" />
								</Link>
							</Button>
						) : (
							<>
								<Button
									asChild
									size="lg"
									className="h-12 rounded-xl bg-[var(--palm)] px-6 text-white shadow-[0_12px_26px_rgba(47,106,74,0.24)] hover:bg-[var(--lagoon-deep)]"
								>
									<Link to="/login">
										Enter your workspace
										<ArrowRight className="size-4" />
									</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="h-12 rounded-xl border-[var(--chip-line)] bg-[var(--surface-strong)] px-5 text-[var(--sea-ink)]"
								>
									<Link to="/setup">Set up your store</Link>
								</Button>
							</>
						)}
					</div>
					{!isPending && session?.user && (
						<p className="mt-4 text-xs text-[var(--sea-ink-soft)]">
							Signed in as{" "}
							<span className="font-bold text-[var(--sea-ink)]">{session.user.email}</span>
						</p>
					)}

					<div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--line)] pt-5 text-xs font-semibold text-[var(--sea-ink-soft)]">
						<span className="inline-flex items-center gap-1.5">
							<Check className="size-3.5 text-[var(--palm)]" /> Thoughtful product management
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Check className="size-3.5 text-[var(--palm)]" /> Secure by design
						</span>
					</div>
				</div>
			</section>

			<section className="mt-10 grid gap-4 sm:grid-cols-3">
				<FeatureCard
					icon={Package}
					title="A home for your catalog"
					description="Keep product details, pricing, stock, and imagery beautifully organized."
					number="01"
				/>
				<FeatureCard
					icon={Users}
					title="People, in good hands"
					description="Manage member accounts and administrator access with confidence."
					number="02"
				/>
				<FeatureCard
					icon={ShieldCheck}
					title="Care built into every step"
					description="Protected routes and server-side authorization guard every write."
					number="03"
				/>
			</section>
		</main>
	);
}

function FeatureCard({
	icon: Icon,
	title,
	description,
	number,
}: {
	icon: typeof Package;
	title: string;
	description: string;
	number: string;
}) {
	return (
		<Card className="feature-card group min-h-52 rounded-2xl border-[var(--line)] bg-[var(--surface)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
			<CardContent className="flex h-full flex-col justify-between gap-6 p-0">
				<div className="flex items-center justify-between">
					<span className="grid size-11 place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--lagoon)_16%,var(--surface-strong))] text-[var(--palm)] transition-transform group-hover:scale-105">
						<Icon className="size-5" />
					</span>
					<span className="text-xs font-bold tracking-[0.16em] text-muted-foreground">
						{number}
					</span>
				</div>
				<div className="space-y-2">
					<p className="font-extrabold tracking-tight text-[var(--sea-ink)]">{title}</p>
					<p className="text-sm leading-6 text-[var(--sea-ink-soft)]">{description}</p>
				</div>
			</CardContent>
		</Card>
	);
}
