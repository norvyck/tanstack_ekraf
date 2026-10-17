import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/AdminShell";
import { getServerSession } from "@/lib/server/auth";

export const Route = createFileRoute("/_admin")({
	beforeLoad: async () => {
		const { session, user, role } = await getServerSession();
		if (!session || !user) {
			throw redirect({ to: "/login" });
		}
		return {
			currentUser: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
			role: role ?? "user",
		};
	},
	component: AdminLayout,
});

function AdminLayout() {
	const { currentUser, role } = Route.useRouteContext();

	return (
		<AdminShell role={role} email={currentUser.email} name={currentUser.name ?? currentUser.email}>
			<Outlet />
		</AdminShell>
	);
}
