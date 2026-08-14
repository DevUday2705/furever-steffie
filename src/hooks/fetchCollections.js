import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const useFirestoreCollections = (collectionNames = []) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchCollections = async () => {
      setIsLoading(true);
      try {
        const snapshots = await Promise.all(
          collectionNames.map(async (collectionName) => {
            const snapshot = await getDocs(collection(db, collectionName));
            return snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              sourceCollection: collectionName,
            }));
          })
        );

        if (isActive) {
          setData(snapshots.flat());
          setError(null);
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching grouped collections:", err);
          setError(err);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchCollections();

    return () => {
      isActive = false;
    };
  }, [collectionNames.join("|")]);

  return { data, isLoading, error };
};