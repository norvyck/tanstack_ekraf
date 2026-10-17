import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, Lock, Mail, ShoppingBag, User } from "lucide-react";
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
		<main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="items-center gap-3 text-center">
					<span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
						<ShoppingBag className="size-6" />
					</span>
					<div className="space-y-1">
						<CardTitle className="text-2xl">
							{isSignUp ? "Create your account" : "Welcome back"}
						</CardTitle>
						<CardDescription>
							{isSignUp
								? "Sign up to get started with the Ekraf admin dashboard."
								: "Sign in to manage your products and users."}
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-5">
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
							className="font-medium text-primary hover:underline"
						>
							{isSignUp ? "Sign in" : "Sign up"}
						</button>
					</div>

					<p className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
						First time here?{" "}
						<Link to="/setup" className="font-medium text-primary hover:underline">
							Seed the admin account
						</Link>
					</p>
				</CardContent>
			</Card>
		</main>
	);
}
