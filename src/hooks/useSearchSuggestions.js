// useSearchSuggestions.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const useSearchSuggestions = () => {
    const collections = ["kurtas", "frocks", "bandanas", "tuxedos", "tuts", "lehengas"];

    const searchAll = async (query) => {
        const lowerQuery = query.toLowerCase();
        const result = {};

        // Helper function to check if product is in stock
        const isProductInStock = (productData) => {
            const managedSizes = ["XS", "S", "M", "L", "XL", "2XL", "4XL", "6XL"];
            const totalStock = managedSizes.reduce((sum, size) => {
                return sum + (productData.sizeStock?.[size] || 0);
            }, 0);
            return totalStock > 0;
        };

        await Promise.all(
            collections.map(async (col) => {
                const snapshot = await getDocs(collection(db, col));
                const matches = snapshot.docs.filter((doc) => {
                    const productData = doc.data();
                    return productData.name.toLowerCase().includes(lowerQuery) && 
                           isProductInStock(productData);
                });
                if (matches.length > 0) {
                    // Return product data with thumbnails instead of just count
                    result[col.slice(0, -1)] = matches.map(doc => {
                        const productData = doc.data();
                        return {
                            id: doc.id,
                            name: productData.name,
                            mainImage: productData.mainImage,
                            type: productData.type || col.slice(0, -1), // fallback to category name
                            pricing: productData.pricing || {}
                        };
                    });
                }
            })
        );

        return result; // e.g. { kurta: [{id, name, mainImage, type, pricing}...], frock: [...] }
    };

    return { searchAll };
};
