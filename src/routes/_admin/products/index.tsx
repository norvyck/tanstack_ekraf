import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	createColumnHelper,
	createSortedRowModel,
	flexRender,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Product } from "@/lib/db";
import { deleteProduct, getProducts } from "@/lib/server/products";

const SKELETON_ROWS = ["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"];

export const Route = createFileRoute("/_admin/products/")({ component: Products });

function Products() {
	const { role } = Route.useRouteContext();
	const isAdmin = role === "admin";
	const queryClient = useQueryClient();
	const deleteFn = useServerFn(deleteProduct);

	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<Product | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
	const [deleting, setDeleting] = useState(false);

	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: () => getProducts(),
	});

	const products = productsQuery.data ?? [];

	const features = tableFeatures({
		rowSortingFeature,
		sortedRowModel: createSortedRowModel(),
	});
	const columnHelper = createColumnHelper<typeof features, Product>();

	const columns = columnHelper.columns([
		columnHelper.display({
			id: "image",
			header: "",
			cell: (info) => {
				const product = info.row.original;
				return (
					<div className="grid size-9 place-items-center overflow-hidden rounded-md border border-border bg-muted/40">
						{product.image ? (
							<img src={product.image} alt="" className="size-full object-cover" />
						) : (
							<ImageIcon className="size-4 text-muted-foreground" />
						)}
					</div>
				);
			},
		}),
		columnHelper.accessor("name", { header: "Name" }),
		columnHelper.accessor("description", {
			header: "Description",
			cell: (info) => (
				<span className="line-clamp-1 max-w-[18rem] text-muted-foreground">{info.getValue()}</span>
			),
		}),
		columnHelper.accessor("price", {
			header: "Price",
			cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
		}),
		columnHelper.accessor("stock", {
			header: "Stock",
			cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
		}),
		columnHelper.display({
			id: "actions",
			header: () => <span className="sr-only">Actions</span>,
			cell: (info) => (
				<RowActions
					product={info.row.original}
					isAdmin={isAdmin}
					onEdit={() => {
						setEditing(info.row.original);
						setFormOpen(true);
					}}
					onDelete={() => setPendingDelete(info.row.original)}
				/>
			),
		}),
	]);

	const table = useTable({
		features,
		columns,
		data: products,
	});

	const handleDelete = async () => {
		if (!pendingDelete) return;
		setDeleting(true);
		try {
			await deleteFn({ data: { id: pendingDelete.id } });
			await queryClient.invalidateQueries({ queryKey: ["products"] });
			setPendingDelete(null);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Delete failed");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-5 shadow-[0_12px_32px_rgba(23,58,64,0.05)] sm:px-7">
				<div>
					<p className="island-kicker">Your catalog</p>
					<h1 className="display-title mt-1 text-4xl leading-tight font-medium tracking-tight text-[var(--sea-ink)] sm:text-5xl">
						Products
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						A little care goes a long way. Keep your catalog fresh.
					</p>
				</div>
				{isAdmin && (
					<Button
						className="h-11 rounded-xl bg-[var(--palm)] px-5 font-bold text-white shadow-[0_10px_24px_rgba(47,106,74,0.2)] hover:bg-[var(--lagoon-deep)]"
						onClick={() => {
							setEditing(null);
							setFormOpen(true);
						}}
					>
						<Plus className="size-4" />
						Add product
					</Button>
				)}
			</div>

			<Card className="overflow-hidden rounded-2xl border-[var(--line)] bg-[var(--surface)] p-0 shadow-[0_18px_48px_rgba(23,58,64,0.07)]">
				<div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 sm:px-6">
					<div>
						<p className="text-sm font-extrabold text-[var(--sea-ink)]">Catalog overview</p>
						<p className="mt-0.5 text-xs text-muted-foreground">
							{products.length} {products.length === 1 ? "item" : "items"} in your collection
						</p>
					</div>
					<span className="rounded-full border border-[var(--chip-line)] bg-[var(--surface-strong)] px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[var(--sea-ink-soft)] uppercase">
						Live catalog
					</span>
				</div>
				{productsQuery.isPending ? (
					<LoadingState />
				) : productsQuery.isError ? (
					<ErrorState
						message={(productsQuery.error as Error).message}
						onRetry={() => void productsQuery.refetch()}
					/>
				) : products.length === 0 ? (
					<EmptyState isAdmin={isAdmin} onAdd={() => setFormOpen(true)} />
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
													className="bg-[color-mix(in_oklab,var(--lagoon)_7%,var(--surface-strong))] px-4 py-3.5 text-left text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase"
												>
													{header.isPlaceholder ? null : (
														<button
															type="button"
															className={
																header.column.getCanSort()
																	? "flex cursor-pointer items-center gap-1 select-none"
																	: "flex items-center gap-1"
															}
															onClick={header.column.getToggleSortingHandler()}
														>
															{flexRender(header.column.columnDef.header, header.getContext())}
															{{
																asc: " \u25b2",
																desc: " \u25bc",
															}[header.column.getIsSorted() as string] ?? null}
														</button>
													)}
												</th>
											))}
										</tr>
									))}
								</thead>
								<tbody>
									{table.getRowModel().rows.map((row) => (
										<tr
											key={row.id}
											className="border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[color-mix(in_oklab,var(--lagoon)_6%,transparent)]"
										>
											{row.getAllCells().map((cell) => (
												<td key={cell.id} className="px-4 py-4 align-middle">
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<ul className="space-y-3 p-3 md:hidden">
							{products.map((product) => (
								<li
									key={product.id}
									className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-3 shadow-sm"
								>
									<div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--line)] bg-[color-mix(in_oklab,var(--lagoon)_8%,var(--surface))]">
										{product.image ? (
											<img src={product.image} alt="" className="size-full object-cover" />
										) : (
											<ImageIcon className="size-4 text-muted-foreground" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-bold text-[var(--sea-ink)]">
											{product.name}
										</p>
										<p className="mt-1 truncate text-xs text-muted-foreground">
											<span className="font-bold text-[var(--palm)]">
												${Number(product.price).toFixed(2)}
											</span>{" "}
											· Stock {product.stock}
										</p>
									</div>
									<RowActions
										product={product}
										isAdmin={isAdmin}
										onEdit={() => {
											setEditing(product);
											setFormOpen(true);
										}}
										onDelete={() => setPendingDelete(product)}
									/>
								</li>
							))}
						</ul>
					</>
				)}
			</Card>

			<ProductFormModal
				open={formOpen}
				onOpenChange={setFormOpen}
				product={editing}
				onSaved={() => void queryClient.invalidateQueries({ queryKey: ["products"] })}
			/>

			<ConfirmDialog
				open={pendingDelete !== null}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null);
				}}
				title="Delete product"
				description={
					<>
						Are you sure you want to delete{" "}
						<span className="font-medium text-foreground">{pendingDelete?.name}</span>? This action
						cannot be undone.
					</>
				}
				loading={deleting}
				onConfirm={handleDelete}
			/>
		</div>
	);
}

function RowActions({
	product,
	isAdmin,
	onEdit,
	onDelete,
}: {
	product: Product;
	isAdmin: boolean;
	onEdit: () => void;
	onDelete: () => void;
}) {
	if (!isAdmin) {
		return <span className="text-xs text-muted-foreground">View only</span>;
	}
	return (
		<div className="flex items-center justify-end gap-1">
			<Button variant="ghost" size="icon-sm" aria-label={`Edit ${product.name}`} onClick={onEdit}>
				<Pencil className="size-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label={`Delete ${product.name}`}
				className="text-destructive hover:text-destructive"
				onClick={onDelete}
			>
				<Trash2 className="size-4" />
			</Button>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="space-y-3 p-4">
			{SKELETON_ROWS.map((rowKey) => (
				<div key={rowKey} className="flex items-center gap-4">
					<div className="size-9 animate-pulse rounded-md bg-muted" />
					<div className="h-4 flex-1 animate-pulse rounded bg-muted" />
					<div className="h-4 w-16 animate-pulse rounded bg-muted" />
				</div>
			))}
		</div>
	);
}

function EmptyState({ isAdmin, onAdd }: { isAdmin: boolean; onAdd: () => void }) {
	return (
		<div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
			<span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
				<ImageIcon className="size-5" />
			</span>
			<div>
				<p className="font-medium">No products yet</p>
				<p className="text-sm text-muted-foreground">
					{isAdmin
						? "Add your first product to get started."
						: "There are no products in the catalog yet."}
				</p>
			</div>
			{isAdmin && (
				<Button onClick={onAdd}>
					<Plus className="size-4" />
					Add product
				</Button>
			)}
		</div>
	);
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
			<p className="font-medium text-destructive">Could not load products</p>
			<p className="text-sm text-muted-foreground">{message}</p>
			<Button variant="outline" onClick={onRetry}>
				Try again
			</Button>
		</div>
	);
}
