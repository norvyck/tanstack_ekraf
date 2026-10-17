// Runtime validation coverage for: Products route data preloading and cache reuse.
import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { productsQueryOptions } from "@/lib/products-query";
import { getProducts } from "@/lib/server/products";

vi.mock("@/lib/server/products", () => ({
	getProducts: vi.fn(),
}));

const getProductsMock = vi.mocked(getProducts);

afterEach(() => {
	vi.clearAllMocks();
});

describe("Products query options", () => {
	it("reuses fresh data preloaded by the route instead of fetching twice", async () => {
		getProductsMock.mockResolvedValue([]);
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const queryOptions = productsQueryOptions();

		try {
			const preloadedProducts = await queryClient.ensureQueryData(queryOptions);
			const renderedProducts = await queryClient.ensureQueryData(queryOptions);

			expect(preloadedProducts).toEqual([]);
			expect(renderedProducts).toEqual(preloadedProducts);
			expect(getProductsMock).toHaveBeenCalledTimes(1);
		} finally {
			queryClient.clear();
		}
	});
});
