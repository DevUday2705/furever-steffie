import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../src/firebase";

const updateAllProducts = async () => {
    try {
        // Update kurtas
        const kurtasSnapshot = await getDocs(collection(db, 'kurtas'));

        for (const docSnapshot of kurtasSnapshot.docs) {
            const productRef = doc(db, 'kurtas', docSnapshot.id);

            // Add default stock for XS, S, M
            await updateDoc(productRef, {
                'sizeStock.XS': 5, // Set default stock
                'sizeStock.S': 5,
                'sizeStock.M': 5
            });

            console.log(`Updated ${docSnapshot.id}`);
        }

        // Repeat for other collections (lehengas, etc.)
        console.log('All products updated with stock!');
    } catch (error) {
        console.error('Error updating products:', error);
    }
};

updateAllProducts();