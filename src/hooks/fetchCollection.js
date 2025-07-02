import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const useFirestoreCollection = (collectionName) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCollection = async () => {
            setIsLoading(true);
            try {
                const snapshot = await getDocs(collection(db, collectionName));
                const documents = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setData(documents);
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