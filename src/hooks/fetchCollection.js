import { useState, useEffect } from "react";
import { getCatalog } from "../utils/catalog";

// Storefront listings - served from the cached catalog, not Firestore.
export const useFirestoreCollection = (collectionName) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCollection = async () => {
            setIsLoading(true);
            try {
                setData(await getCatalog(collectionName));
            } catch (err) {
                console.error(`Error fetching ${collectionName}:`, err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollection();
    }, [collectionName]);

    return { data, isLoading, error };
};