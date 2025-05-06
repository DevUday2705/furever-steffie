// useProductFilter.js
import { useMemo } from "react";

export const useProductFilter = (products, filters) => {
    return useMemo(() => {
        let list = [...products];

        if (filters.inStockOnly) {
            list = list.filter((p) => p.availableStock > 0);
        }

        list = list.filter(
            (p) =>
                p.pricing.basePrice + (p.pricing.beadedAdditional || 0) <=
                filters.maxPrice
        );

        if (filters.sizes.length) {
            list = list.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
        }

        if (filters.categories.includes("royal")) {
            list = list.filter((item) => item.category === "royal");
        }

        if (filters.styleBeaded) {
            list = list.filter((p) => p.isBeadedAvailable);
        }
        if (filters.styleSimple) {
            list = list.filter((p) => p.isNonBeadedAvailable);
        }

        if (filters.customColor) {
            list = list.filter((p) => p.contactForCustomColors);
        }

        if (filters.sortBy === "popularity") {
            list.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
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
    }, [products, filters]);
};
