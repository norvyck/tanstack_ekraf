import { useForm } from "@tanstack/react-form";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/db";
import { MAX_IMAGE_DIMENSION, downscaleImageFile } from "@/lib/image";
import { createProduct, updateProduct } from "@/lib/server/products";
import { cn } from "cn";

type ProductFormValues = {
	name: string;
	description: string;
	price: string;
	stock: string;
};

function FieldError({ errors, show }: { errors: unknown[]; show: boolean }) {
	if (!show || errors.length === 0) return null;
	const text = errors
		.map((error) =>
			typeof error === "string" ? error : ((error as { message?: string })?.message ?? ""),
		)
		.filter(Boolean)
		.join(", ");
	if (!text) return null;
	return <p className="text-xs text-destructive">{text}</p>;
}

export function ProductFormModal({
	open,
	onOpenChange,
	product,
	onSaved,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product: Product | null;
	onSaved: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				{open && (
					<ProductFormBody
						key={product?.id ?? "new"}
						product={product}
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

function ProductFormBody({
	product,
	onCancel,
	onSaved,
}: {
	product: Product | null;
	onCancel: () => void;
	onSaved: () => void;
}) {
	const isEdit = product !== null;
	const createFn = useServerFn(createProduct);
	const updateFn = useServerFn(updateProduct);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [image, setImage] = useState<string | null>(product?.image ?? null);
	const [imageError, setImageError] = useState("");
	const [imageBusy, setImageBusy] = useState(false);
	const [formError, setFormError] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const form = useForm({
		defaultValues: {
			name: product?.name ?? "",
			description: product?.description ?? "",
			price: product ? String(product.price) : "",
			stock: product ? String(product.stock) : "",
		} as ProductFormValues,
		onSubmit: async ({ value }) => {
			setFormError("");
			try {
				const payload = {
					name: value.name.trim(),
					description: value.description.trim(),
					price: Number(value.price),
					stock: Number(value.stock),
					image,
				};

				if (isEdit && product) {
					await updateFn({ data: { id: product.id, ...payload } });
				} else {
					await createFn({ data: payload });
				}
				onSaved();
			} catch (error) {
				setFormError(error instanceof Error ? error.message : "Something went wrong.");
			}
		},
	});

	const handleFile = async (file: File | undefined) => {
		if (!file) return;
		setImageError("");

		if (!file.type.startsWith("image/")) {
			setImageError("Please choose an image file (PNG, JPEG, GIF, or WebP).");
			return;
		}

		setImageBusy(true);
		try {
			const dataUrl = await downscaleImageFile(file, MAX_IMAGE_DIMENSION);
			setImage(dataUrl);
		} catch (error) {
			setImageError(error instanceof Error ? error.message : "Could not process that image.");
		} finally {
			setImageBusy(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	return (
		<>
			<DialogHeader>
				<DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
				<DialogDescription>
					{isEdit
						? "Update the details below and save your changes."
						: "Fill in the details below to add a product to the catalog."}
				</DialogDescription>
			</DialogHeader>

			{formError && (
				<div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{formError}
				</div>
			)}

			<form
				className="grid gap-5"
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					setSubmitted(true);
					void form.handleSubmit();
				}}
			>
				<form.Field
					name="name"
					validators={{
						onChange: ({ value }) => (value.trim() ? undefined : "Name is required."),
						onSubmit: ({ value }) => (value.trim() ? undefined : "Name is required."),
					}}
				>
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="product-name">Name</Label>
							<Input
								id="product-name"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								onBlur={field.handleBlur}
								placeholder="e.g. Starter Kit"
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							<FieldError
								errors={field.state.meta.errors}
								show={submitted || field.state.meta.isTouched}
							/>
						</div>
					)}
				</form.Field>

				<form.Field
					name="description"
					validators={{
						onChange: ({ value }) => (value.trim() ? undefined : "Description is required."),
						onSubmit: ({ value }) => (value.trim() ? undefined : "Description is required."),
					}}
				>
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="product-description">Description</Label>
							<Textarea
								id="product-description"
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								onBlur={field.handleBlur}
								placeholder="e.g. Everything you need to begin."
								rows={3}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							<FieldError
								errors={field.state.meta.errors}
								show={submitted || field.state.meta.isTouched}
							/>
						</div>
					)}
				</form.Field>

				<div className="grid gap-4 sm:grid-cols-2">
					<form.Field
						name="price"
						validators={{
							onChange: ({ value }) => {
								if (value.trim() === "") return "Price is required.";
								if (!Number.isFinite(Number(value)) || Number(value) < 0)
									return "Price must be a positive number.";
								return undefined;
							},
							onSubmit: ({ value }) => {
								if (value.trim() === "") return "Price is required.";
								if (!Number.isFinite(Number(value)) || Number(value) < 0)
									return "Price must be a positive number.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="grid gap-2">
								<Label htmlFor="product-price">Price ($)</Label>
								<Input
									id="product-price"
									type="number"
									min="0"
									step="0.01"
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									placeholder="0.00"
									aria-invalid={field.state.meta.errors.length > 0}
								/>
								<FieldError
									errors={field.state.meta.errors}
									show={submitted || field.state.meta.isTouched}
								/>
							</div>
						)}
					</form.Field>

					<form.Field
						name="stock"
						validators={{
							onChange: ({ value }) => {
								if (value.trim() === "") return "Stock is required.";
								if (!Number.isInteger(Number(value)) || Number(value) < 0)
									return "Stock must be a whole, non-negative number.";
								return undefined;
							},
							onSubmit: ({ value }) => {
								if (value.trim() === "") return "Stock is required.";
								if (!Number.isInteger(Number(value)) || Number(value) < 0)
									return "Stock must be a whole, non-negative number.";
								return undefined;
							},
						}}
					>
						{(field) => (
							<div className="grid gap-2">
								<Label htmlFor="product-stock">Stock</Label>
								<Input
									id="product-stock"
									type="number"
									min="0"
									step="1"
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									onBlur={field.handleBlur}
									placeholder="0"
									aria-invalid={field.state.meta.errors.length > 0}
								/>
								<FieldError
									errors={field.state.meta.errors}
									show={submitted || field.state.meta.isTouched}
								/>
							</div>
						)}
					</form.Field>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="product-image">Product image</Label>
					<div className="flex items-start gap-4">
						<div
							className={cn(
								"grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40",
								image && "border-solid",
							)}
						>
							{image ? (
								<img src={image} alt="Product preview" className="size-full object-cover" />
							) : (
								<ImagePlus className="size-6 text-muted-foreground" />
							)}
						</div>
						<div className="grid gap-2">
							<input
								ref={fileInputRef}
								id="product-image"
								type="file"
								accept="image/png,image/jpeg,image/webp,image/gif"
								className="sr-only"
								onChange={(event) => void handleFile(event.target.files?.[0])}
							/>
							<div className="flex flex-wrap gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={imageBusy}
									onClick={() => fileInputRef.current?.click()}
								>
									{imageBusy ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Upload className="size-4" />
									)}
									{image ? "Replace" : "Upload image"}
								</Button>
								{image && (
									<Button type="button" variant="ghost" size="sm" onClick={() => setImage(null)}>
										<X className="size-4" />
										Remove
									</Button>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								Max {MAX_IMAGE_DIMENSION}×{MAX_IMAGE_DIMENSION}px. Larger images are downscaled
								automatically before saving.
							</p>
							{imageError && <p className="text-xs text-destructive">{imageError}</p>}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={form.state.isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={form.state.isSubmitting || imageBusy}>
						{form.state.isSubmitting && <Loader2 className="size-4 animate-spin" />}
						{isEdit ? "Save changes" : "Create product"}
					</Button>
				</DialogFooter>
			</form>
		</>
	);
}
