// useSearchSuggestions.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const useSearchSuggestions = () => {
    const collections = ["kurtas", "frocks", "bandanas", "tuxedos"];

    const searchAll = async (query) => {
        const lowerQuery = query.toLowerCase();
        const result = {};

        await Promise.all(
            collections.map(async (col) => {
                const snapshot = await getDocs(collection(db, col));
                const matches = snapshot.docs.filter((doc) =>
                    doc.data().name.toLowerCase().includes(lowerQuery)
                );
                if (matches.length > 0) {
                    result[col.slice(0, -1)] = matches.length; // "kurtas" → "kurta"
                }
            })
        );

        return result; // e.g. { kurta: 2, frock: 3 }
    };

    return { searchAll };
};
