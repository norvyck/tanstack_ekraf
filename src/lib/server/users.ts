import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db, getUserRole, removeUserRole, setUserRole } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const userRoleSchema = z.object({
	userId: z.string(),
	role: z.enum(["admin", "user"]),
});

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdmin();
	return db.user.map((u) => ({
		id: u.id,
		email: u.email,
		name: u.name,
		role: getUserRole(u.id),
		emailVerified: !!u.emailVerified,
		createdAt: u.createdAt.toISOString(),
	}));
});

export const updateUserRole = createServerFn({ method: "POST" })
	.validator(userRoleSchema)
	.handler(async ({ data }) => {
		const { user } = await requireAdmin();

		// Prevent an administrator from demoting themselves, which would
		// lock them out of the admin area.
		if (data.userId === user.id && data.role !== "admin") {
			const err = new Error("You cannot demote your own account.") as Error & {
				status?: number;
			};
			err.status = 400;
			throw err;
		}

		// Prevent removing the last administrator.
		if (data.role !== "admin" && getUserRole(data.userId) === "admin") {
			const adminCount = db.userRole.filter((r) => r.role === "admin").length;
			if (adminCount <= 1) {
				const err = new Error("Cannot demote the last administrator.") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
		}

		setUserRole(data.userId, data.role);
		return { ok: true };
	});

export const deleteUser = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		const { user } = await requireAdmin();

		// Prevent an administrator from deleting their own account.
		if (data.userId === user.id) {
			const err = new Error("You cannot delete your own account.") as Error & {
				status?: number;
			};
			err.status = 400;
			throw err;
		}

		// Prevent removing the last administrator so the app never locks itself out.
		const role = getUserRole(data.userId);
		if (role === "admin") {
			const adminCount = db.userRole.filter((r) => r.role === "admin").length;
			if (adminCount <= 1) {
				const err = new Error("Cannot delete the last administrator") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
		}
		db.user = db.user.filter((u) => u.id !== data.userId);
		removeUserRole(data.userId);
		return { ok: true };
	});
