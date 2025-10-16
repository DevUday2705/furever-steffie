import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Initialize the order pause settings in Firebase if it doesn't exist
 * This should be called once to set up the document
 */
export const initializeOrderPauseSettings = async () => {
    try {
        const orderPauseRef = doc(db, "settings", "orderPause");
        const docSnapshot = await getDoc(orderPauseRef);

        if (!docSnapshot.exists()) {
            // Create the document with default settings
            await setDoc(orderPauseRef, {
                ordersArePaused: false, // Default: orders are active
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                updatedBy: "system",
                description: "Global order pause/resume setting"
            });
            console.log("Order pause settings initialized in Firebase");
        }
    } catch (error) {
        console.error("Error initializing order pause settings:", error);
    }
};

/**
 * Manually set the order pause status (useful for admin operations)
 */
export const setOrderPauseStatus = async (pauseStatus, updatedBy = "admin") => {
    try {
        const orderPauseRef = doc(db, "settings", "orderPause");
        await setDoc(orderPauseRef, {
            ordersArePaused: pauseStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: updatedBy
        }, { merge: true });

        return true;
    } catch (error) {
        console.error("Error setting order pause status:", error);
        throw error;
    }
};

/**
 * Get the current order pause status
 */
export const getOrderPauseStatus = async () => {
    try {
        const orderPauseRef = doc(db, "settings", "orderPause");
        const docSnapshot = await getDoc(orderPauseRef);

        if (docSnapshot.exists()) {
            return docSnapshot.data().ordersArePaused || false;
        }

        // If document doesn't exist, orders are not paused by default
        return false;
    } catch (error) {
        console.error("Error getting order pause status:", error);
        return false; // Default to not paused on error
    }
};