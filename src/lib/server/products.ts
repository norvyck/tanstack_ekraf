import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { type Product, db } from "@/lib/db";
import { validateProductImage } from "@/lib/image";
import { requireAdmin, requireAuth } from "@/lib/session";

const imageSchema = z
	.string()
	.nullish()
	.superRefine((value, ctx) => {
		const result = validateProductImage(value ?? null);
		if (!result.ok) {
			ctx.addIssue({ code: "custom", message: result.error });
		}
	})
	.transform((value) => (value == null || value.trim() === "" ? null : value.trim()));

// Strip any HTML tags from user-supplied text fields to prevent stored XSS
// even if a value is ever rendered with dangerouslySetInnerHTML.
const sanitizeText = (value: string) => value.replace(/<[^>]*>/g, "").trim();

export const productSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.max(120, "Name is too long")
		.transform(sanitizeText),
	description: z
		.string()
		.trim()
		.min(1, "Description is required")
		.max(2000, "Description is too long")
		.transform(sanitizeText),
	price: z.coerce.number().min(0, "Price must be positive").max(1_000_000, "Price is too high"),
	stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock must be positive"),
	image: imageSchema,
});

export type ProductInput = z.infer<typeof productSchema>;

// TanStack Start server functions support GET and POST only. Mutations use
// POST and encode the intended action in the validator/body.
export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
	await requireAuth();
	return [...db.product].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Product[];
});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productSchema)
	.handler(async ({ data }) => {
		await requireAdmin();
		const now = new Date().toISOString();
		const product = {
			id: crypto.randomUUID(),
			...data,
			createdAt: now,
			updatedAt: now,
		} as Product;
		db.product.push(product);
		return product;
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string(),
			...productSchema.shape,
		}),
	)
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Product not found") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		const now = new Date().toISOString();
		const updated = {
			...db.product[index],
			name: data.name,
			description: data.description,
			price: data.price,
			stock: data.stock,
			image: data.image,
			updatedAt: now,
		} as Product;
		db.product[index] = updated;
		return updated;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Product not found") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		db.product.splice(index, 1);
		return { ok: true };
	});
