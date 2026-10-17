import { queryOptions } from "@tanstack/react-query";

import { getProducts } from "@/lib/server/products";

export const productsQueryOptions = () =>
	queryOptions({
		queryKey: ["products"] as const,
		queryFn: () => getProducts(),
		staleTime: 30_000,
	});
