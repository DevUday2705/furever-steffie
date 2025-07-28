import { useMemo } from "react";

export const useProductFilter = (products, filters, searchQuery = "") => {
    return useMemo(() => {
        let list = [...products];

        // ✅ 1. Search filter (by name)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((p) => p.name.toLowerCase().includes(q));
        }

        // ✅ 2. In Stock Only
        if (filters.inStockOnly) {
            list = list.filter((p) => p.availableStock > 0);
        }

        // ✅ 3. Price cap
        list = list.filter(
            (p) =>
                p.pricing.basePrice + (p.pricing.beadedAdditional || 0) <=
                filters.maxPrice
        );

        // ✅ 4. Sizes
        if (filters.sizes.length) {
            list = list.filter((p) =>
                p.sizes.some((s) => filters.sizes.includes(s))
            );
        }

        // ✅ 5. Category
        if (filters.categories.includes("royal")) {
            list = list.filter((item) => item.isRoyal === true);
        }

        // ✅ 6. Style
        if (filters.styleBeaded) {
            list = list.filter((p) => p.isBeadedAvailable);
        }
        if (filters.styleSimple) {
            list = list.filter((p) => p.isNonBeadedAvailable);
        }

        // ✅ 7. Custom Color
        if (filters.customColor) {
            list = list.filter((p) => p.contactForCustomColors);
        }

        // ✅ 8. Sorting
        if (filters.sortBy === "popularity") {
            list.sort(
                (a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)
            );
        } else if (filters.sortBy === "price-asc") {
            list.sort(
                (a, b) =>
                    a.pricing.basePrice + (a.pricing.beadedAdditional || 0) -
                    (b.pricing.basePrice + (b.pricing.beadedAdditional || 0))
            );
        } else if (filters.sortBy === "price-desc") {
            list.sort(
                (a, b) =>
                    b.pricing.basePrice + (b.pricing.beadedAdditional || 0) -
                    (a.pricing.basePrice + (a.pricing.beadedAdditional || 0))
            );
        }

        return list;
    }, [products, filters, searchQuery]);
};
