import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { createColumnHelper, flexRender, tableFeatures, useTable } from "@tanstack/react-table";
import { ShieldCheck, Trash2, UserCog } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { UserRoleModal, type UserRoleTarget } from "@/components/admin/UserRoleModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Role } from "@/lib/db";
import { deleteUser, getUsers } from "@/lib/server/users";

const SKELETON_ROWS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"];

type UserRow = {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	emailVerified: boolean;
	createdAt: string;
};

export const Route = createFileRoute("/_admin/users/")({
	beforeLoad: ({ context }) => {
		if (context.role !== "admin") {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: Users,
});

function Users() {
	const { currentUser } = Route.useRouteContext();
	const queryClient = useQueryClient();
	const deleteFn = useServerFn(deleteUser);

	const [roleTarget, setRoleTarget] = useState<UserRoleTarget | null>(null);
	const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);
	const [deleting, setDeleting] = useState(false);

	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: () => getUsers(),
	});

	const users = usersQuery.data ?? [];
	const adminCount = users.filter((user) => user.role === "admin").length;

	const features = tableFeatures({});
	const columnHelper = createColumnHelper<typeof features, UserRow>();

	const columns = columnHelper.columns([
		columnHelper.accessor("name", {
			header: "Name",
			cell: (info) => <span className="font-medium">{info.getValue() ?? "\u2014"}</span>,
		}),
		columnHelper.accessor("email", { header: "Email" }),
		columnHelper.accessor("role", {
			header: "Role",
			cell: (info) => (
				<Badge variant={info.getValue() === "admin" ? "default" : "muted"}>
					{info.getValue() === "admin" ? "Admin" : "User"}
				</Badge>
			),
		}),
		columnHelper.accessor("emailVerified", {
			header: "Verified",
			cell: (info) =>
				info.getValue() ? (
					<Badge variant="success">Verified</Badge>
				) : (
					<Badge variant="muted">Pending</Badge>
				),
		}),
		columnHelper.accessor("createdAt", {
			header: "Joined",
			cell: (info) => new Date(info.getValue()).toLocaleDateString(),
		}),
		columnHelper.display({
			id: "actions",
			header: () => <span className="sr-only">Actions</span>,
			cell: (info) => {
				const user = info.row.original;
				const isLastAdmin = user.role === "admin" && adminCount <= 1;
				const isSelf = user.id === currentUser.id;
				return (
					<UserActions
						isLastAdmin={isLastAdmin}
						isSelf={isSelf}
						onManageRole={() => setRoleTarget(user)}
						onDelete={() => setPendingDelete(user)}
					/>
				);
			},
		}),
	]);

	const table = useTable({ features, columns, data: users });

	const handleDelete = async () => {
		if (!pendingDelete) return;
		setDeleting(true);
		try {
			await deleteFn({ data: { userId: pendingDelete.id } });
			await queryClient.invalidateQueries({ queryKey: ["users"] });
			setPendingDelete(null);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Delete failed");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage accounts and administrator access.
				</p>
			</div>

			<Card className="overflow-hidden p-0">
				{usersQuery.isPending ? (
					<div className="space-y-3 p-4">
						{SKELETON_ROWS.map((rowKey) => (
							<div key={rowKey} className="flex items-center gap-4">
								<div className="h-4 flex-1 animate-pulse rounded bg-muted" />
								<div className="h-4 w-24 animate-pulse rounded bg-muted" />
							</div>
						))}
					</div>
				) : usersQuery.isError ? (
					<div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
						<p className="font-medium text-destructive">Could not load users</p>
						<p className="text-sm text-muted-foreground">{(usersQuery.error as Error).message}</p>
						<Button variant="outline" onClick={() => void usersQuery.refetch()}>
							Try again
						</Button>
					</div>
				) : users.length === 0 ? (
					<div className="px-6 py-16 text-center text-sm text-muted-foreground">No users yet.</div>
				) : (
					<>
						<div className="hidden overflow-x-auto md:block">
							<table className="w-full border-collapse text-sm">
								<thead>
									{table.getHeaderGroups().map((headerGroup) => (
										<tr key={headerGroup.id} className="border-b border-border">
											{headerGroup.headers.map((header) => (
												<th
													key={header.id}
													colSpan={header.colSpan}
													className="bg-muted/40 px-4 py-3 text-left text-xs font-semibold text-muted-foreground"
												>
													{header.isPlaceholder
														? null
														: flexRender(header.column.columnDef.header, header.getContext())}
												</th>
											))}
										</tr>
									))}
								</thead>
								<tbody>
									{table.getRowModel().rows.map((row) => (
										<tr
											key={row.id}
											className="border-b border-border last:border-0 hover:bg-muted/30"
										>
											{row.getAllCells().map((cell) => (
												<td key={cell.id} className="px-4 py-3 align-middle">
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<ul className="divide-y divide-border md:hidden">
							{users.map((user) => {
								const isLastAdmin = user.role === "admin" && adminCount <= 1;
								const isSelf = user.id === currentUser.id;
								return (
									<li key={user.id} className="space-y-3 p-4">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="truncate text-sm font-medium">{user.name ?? "\u2014"}</p>
												<p className="truncate text-xs text-muted-foreground">{user.email}</p>
											</div>
											<Badge variant={user.role === "admin" ? "default" : "muted"}>
												{user.role === "admin" ? "Admin" : "User"}
											</Badge>
										</div>
										<UserActions
											isLastAdmin={isLastAdmin}
											isSelf={isSelf}
											onManageRole={() => setRoleTarget(user)}
											onDelete={() => setPendingDelete(user)}
										/>
									</li>
								);
							})}
						</ul>
					</>
				)}
			</Card>

			<UserRoleModal
				open={roleTarget !== null}
				onOpenChange={(open) => {
					if (!open) setRoleTarget(null);
				}}
				user={roleTarget}
				onSaved={() => void queryClient.invalidateQueries({ queryKey: ["users"] })}
			/>

			<ConfirmDialog
				open={pendingDelete !== null}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null);
				}}
				title="Delete user"
				description={
					<>
						Are you sure you want to delete{" "}
						<span className="font-medium text-foreground">
							{pendingDelete?.name ?? pendingDelete?.email}
						</span>
						? This action cannot be undone.
					</>
				}
				loading={deleting}
				onConfirm={handleDelete}
			/>
		</div>
	);
}

function UserActions({
	isLastAdmin,
	isSelf,
	onManageRole,
	onDelete,
}: {
	isLastAdmin: boolean;
	isSelf: boolean;
	onManageRole: () => void;
	onDelete: () => void;
}) {
	return (
		<div className="flex items-center justify-end gap-2">
			<Button variant="outline" size="sm" onClick={onManageRole}>
				<UserCog className="size-4" />
				Manage role
			</Button>
			{isLastAdmin ? (
				<Badge variant="muted" className="gap-1">
					<ShieldCheck className="size-3" />
					Last admin
				</Badge>
			) : (
				<Button
					variant="ghost"
					size="icon-sm"
					className="text-destructive hover:text-destructive"
					aria-label="Delete user"
					onClick={onDelete}
					title={isSelf ? "Delete your own account" : "Delete user"}
				>
					<Trash2 className="size-4" />
				</Button>
			)}
		</div>
	);
}
