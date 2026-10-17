import { Link, createFileRoute } from "@tanstack/react-router";
import { Loader2, Sprout } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { seedAdmin } from "@/lib/server/auth";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/setup")({ component: Setup });

function Setup() {
	const seedAdminFn = useServerFn(seedAdmin);
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState("");

	const handleSeed = async () => {
		setStatus("loading");
		setMessage("");
		try {
			const result = await seedAdminFn();
			setStatus("success");
			setMessage(
				result.alreadySeeded
					? "Admin account already exists."
					: "Admin account seeded. Sign in at /login with admin@example.com / admin12345",
			);
		} catch (err) {
			setStatus("error");
			setMessage(err instanceof Error ? err.message : "Seed failed");
		}
	};

	return (
		<main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
			<Card className="w-full max-w-lg shadow-lg">
				<CardHeader className="gap-3">
					<span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
						<Sprout className="size-6" />
					</span>
					<div className="space-y-1">
						<CardTitle className="text-2xl">Seed Admin Account</CardTitle>
						<CardDescription>
							Creates the administrator account (password hashed by Better Auth) and seeds sample
							products. Run this once after deploying.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-5">
					<p className="text-sm text-muted-foreground">
						This sets up <span className="font-medium text-foreground">admin@example.com</span> /
						<span className="font-medium text-foreground">admin12345</span> and three sample
						products. Safe to re-run; seeding is idempotent.
					</p>

					<Button onClick={handleSeed} disabled={status === "loading"} className="w-full">
						{status === "loading" && <Loader2 className="size-4 animate-spin" />}
						{status === "loading" ? "Seeding..." : "Seed Admin Account"}
					</Button>

					{status !== "idle" && (
						<div
							className={
								status === "success"
									? "rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400"
									: "rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
							}
						>
							{message}
						</div>
					)}

					<p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link to="/login" className="font-medium text-primary hover:underline">
							Sign in
						</Link>
					</p>
				</CardContent>
			</Card>
		</main>
	);
}
