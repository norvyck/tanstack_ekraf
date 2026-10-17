import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	Check,
	Loader2,
	Lock,
	Mail,
	Package,
	ShieldCheck,
	ShoppingBag,
	User,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getServerSession } from "@/lib/server/auth";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (session) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"signin" | "signup">("signin");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const isSignUp = mode === "signup";

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError("");
		setLoading(true);

		try {
			const result = isSignUp
				? await authClient.signUp.email({ email, password, name })
				: await authClient.signIn.email({ email, password });

			if (result.error) {
				setError(
					result.error.message ??
						(isSignUp ? "Could not create your account." : "Invalid email or password."),
				);
				return;
			}

			await navigate({ to: "/dashboard" });
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
			<div className="absolute top-10 left-1/2 -z-10 size-[32rem] -translate-x-1/2 rounded-full bg-[var(--hero-a)] opacity-40 blur-3xl" />
			<Card className="w-full max-w-5xl overflow-hidden rounded-[2rem] border-[var(--line)] bg-[var(--surface-strong)] p-0 shadow-[0_32px_100px_rgba(23,58,64,0.16)] backdrop-blur-xl lg:grid lg:grid-cols-[0.9fr_1.1fr]">
				<section className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,var(--sea-ink),#24594f_58%,var(--palm))] p-10 text-white lg:flex">
					<div className="absolute -top-24 -right-24 size-80 rounded-full border border-white/10 bg-white/5" />
					<div className="absolute right-10 bottom-28 size-52 rounded-full border border-white/15 bg-[radial-gradient(circle_at_35%_30%,rgba(141,229,219,0.45),rgba(141,229,219,0.04)_70%)]" />
					<div className="absolute right-16 bottom-36 grid size-36 place-items-center rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md rotate-6">
						<ShoppingBag className="size-16 text-[#b8efe5]" strokeWidth={1.2} />
					</div>
					<div className="relative z-10">
						<Link
							to="/"
							className="inline-flex items-center gap-2 text-sm font-bold text-white no-underline"
						>
							<span className="grid size-9 place-items-center rounded-xl bg-white/15">
								<ShoppingBag className="size-4" />
							</span>
							Ekraf Studio
						</Link>
						<div className="mt-24 max-w-sm">
							<p className="text-xs font-bold tracking-[0.2em] text-[#a9e4d4] uppercase">
								A little more intentional
							</p>
							<h2 className="display-title mt-4 text-5xl leading-[1.05] font-medium tracking-tight">
								Good work deserves a good workspace.
							</h2>
							<p className="mt-5 text-sm leading-7 text-white/75">
								Everything you need to nurture your catalog and the people behind it.
							</p>
						</div>
					</div>
					<div className="relative z-10 space-y-3 text-sm text-white/80">
						<p className="flex items-center gap-2">
							<Check className="size-4 text-[#a9e4d4]" /> A clear view of your products
						</p>
						<p className="flex items-center gap-2">
							<ShieldCheck className="size-4 text-[#a9e4d4]" /> Protected admin access
						</p>
						<p className="flex items-center gap-2">
							<Package className="size-4 text-[#a9e4d4]" /> A calmer way to manage your store
						</p>
					</div>
				</section>

				<section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
					<div className="w-full max-w-md">
						<Link
							to="/"
							className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground no-underline transition hover:text-foreground"
						>
							<ArrowLeft className="size-3.5" />
							Back to home
						</Link>
						<CardHeader className="items-start gap-4 p-0 text-left">
							<span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(145deg,var(--lagoon),var(--palm))] text-white shadow-[0_10px_24px_rgba(47,106,74,0.2)]">
								<ShoppingBag className="size-5" />
							</span>
							<div className="space-y-2">
								<p className="island-kicker">{isSignUp ? "Start your journey" : "Welcome back"}</p>
								<CardTitle className="text-3xl font-extrabold tracking-tight text-[var(--sea-ink)]">
									{isSignUp ? "Create your account" : "Sign in to Ekraf"}
								</CardTitle>
								<CardDescription className="max-w-sm leading-6">
									{isSignUp
										? "Create an account to get started with your workspace."
										: "Your creative workspace is ready when you are."}
								</CardDescription>
							</div>
						</CardHeader>

						<CardContent className="mt-7 space-y-5 p-0">
							{error && (
								<div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
									<AlertCircle className="mt-0.5 size-4 shrink-0" />
									<span>{error}</span>
								</div>
							)}

							<form onSubmit={handleSubmit} className="grid gap-4">
								{isSignUp && (
									<div className="grid gap-2">
										<Label htmlFor="name">Name</Label>
										<div className="relative">
											<User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="name"
												autoComplete="name"
												value={name}
												onChange={(event) => setName(event.target.value)}
												placeholder="Ada Lovelace"
												className="pl-9"
												required
											/>
										</div>
									</div>
								)}

								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<div className="relative">
										<Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											id="email"
											type="email"
											autoComplete="email"
											value={email}
											onChange={(event) => setEmail(event.target.value)}
											placeholder="you@example.com"
											className="pl-9"
											required
										/>
									</div>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="password">Password</Label>
									<div className="relative">
										<Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											id="password"
											type="password"
											autoComplete={isSignUp ? "new-password" : "current-password"}
											value={password}
											onChange={(event) => setPassword(event.target.value)}
											placeholder="••••••••"
											className="pl-9"
											required
											minLength={8}
										/>
									</div>
									{isSignUp && (
										<p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
									)}
								</div>

								<Button type="submit" className="w-full" disabled={loading}>
									{loading && <Loader2 className="size-4 animate-spin" />}
									{isSignUp ? "Create account" : "Sign in"}
								</Button>
							</form>

							<div className="text-center text-sm text-muted-foreground">
								{isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
								<button
									type="button"
									onClick={() => {
										setMode(isSignUp ? "signin" : "signup");
										setError("");
									}}
									className="font-bold text-[var(--lagoon-deep)] hover:underline"
								>
									{isSignUp ? "Sign in" : "Sign up"}
								</button>
							</div>

							<p className="border-t border-[var(--line)] pt-4 text-center text-xs text-muted-foreground">
								First time here?{" "}
								<Link to="/setup" className="font-bold text-[var(--lagoon-deep)] hover:underline">
									Seed the admin account
								</Link>
							</p>
						</CardContent>
					</div>
				</section>
			</Card>
		</main>
	);
}
