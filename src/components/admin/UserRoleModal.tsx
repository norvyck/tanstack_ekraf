import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/lib/db";
import { updateUserRole } from "@/lib/server/users";

export type UserRoleTarget = {
	id: string;
	name: string | null;
	email: string;
	role: Role;
};

export function UserRoleModal({
	open,
	onOpenChange,
	user,
	onSaved,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: UserRoleTarget | null;
	onSaved: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				{open && user && (
					<UserRoleBody
						key={user.id}
						user={user}
						onCancel={() => onOpenChange(false)}
						onSaved={() => {
							onSaved();
							onOpenChange(false);
						}}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function UserRoleBody({
	user,
	onCancel,
	onSaved,
}: {
	user: UserRoleTarget;
	onCancel: () => void;
	onSaved: () => void;
}) {
	const updateRoleFn = useServerFn(updateUserRole);
	const [role, setRole] = useState<Role>(user.role);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		setError("");
		setSaving(true);
		try {
			await updateRoleFn({ data: { userId: user.id, role } });
			onSaved();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not update the role.");
			setSaving(false);
		}
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>Manage role</DialogTitle>
				<DialogDescription>
					Change what {user.name ?? user.email} is allowed to access.
				</DialogDescription>
			</DialogHeader>

			<div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
				<p className="truncate text-sm font-medium">{user.name ?? "\u2014"}</p>
				<p className="truncate text-xs text-muted-foreground">{user.email}</p>
			</div>

			{error && (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</div>
			)}

			<div className="grid gap-2">
				<Label htmlFor="user-role">Role</Label>
				<Select value={role} onValueChange={(value) => setRole(value as Role)}>
					<SelectTrigger id="user-role" className="w-full">
						<SelectValue placeholder="Select a role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="user">User</SelectItem>
						<SelectItem value="admin">Administrator</SelectItem>
					</SelectContent>
				</Select>
				<p className="text-xs text-muted-foreground">
					Administrators can manage products and users. Users can only view the catalog.
				</p>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
					Cancel
				</Button>
				<Button type="button" onClick={handleSave} disabled={saving || role === user.role}>
					{saving && <Loader2 className="size-4 animate-spin" />}
					Save role
				</Button>
			</DialogFooter>
		</>
	);
}
