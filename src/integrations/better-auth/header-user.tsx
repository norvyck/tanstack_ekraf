import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />;
	}

	if (session?.user) {
		return (
			<div className="flex items-center gap-2">
				<span className="hidden max-w-[10rem] truncate text-sm text-[var(--sea-ink-soft)] sm:inline">
					{session.user.email}
				</span>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						void authClient.signOut().then(() => navigate({ to: "/" }));
					}}
				>
					<LogOut className="size-4" />
					Sign out
				</Button>
			</div>
		);
	}

	return (
		<Button asChild size="sm">
			<Link to="/login">Sign in</Link>
		</Button>
	);
}
