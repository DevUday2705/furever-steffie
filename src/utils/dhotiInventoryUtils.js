// Firebase Schema for Centralized Dhoti Inventory
// This script initializes the centralized dhoti system in Firebase

import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Centralized dhoti inventory structure
export const initializeDhotiInventory = async () => {
  const dhotiInventory = {
    // Each dhoti style with inventory by size
    white: {
      id: 'white',
      name: 'White',
      image: 'https://res.cloudinary.com/di6unrpjw/image/upload/v1737398143/white-dhoti.jpg', // Update with actual image URL
      inventory: {
        XS: 5,
        S: 10,
        M: 10, 
        L: 0  // Initially L is not available as per requirement
      }
    },
    black: {
      id: 'black',
      name: 'Black',
      image: 'https://res.cloudinary.com/di6unrpjw/image/upload/v1737398143/black-dhoti.jpg', // Update with actual image URL
      inventory: {
        XS: 0, // Not mentioned in requirement
        S: 10,  // Example quantity
        M: 10,  // Not mentioned
        L: 0   // Initially not available
      }
    },
    gold: {
      id: 'gold',
      name: 'Gold',
      image: 'https://res.cloudinary.com/di6unrpjw/image/upload/v1737398143/gold-dhoti.jpg', // Update with actual image URL
      inventory: {
        XS: 0, // Not mentioned in requirement
        S: 10,  // Not mentioned
        M: 10,  // Not mentioned  
        L: 0   // Initially not available
      }
    }
  };

  try {
    // Create the dhotis collection document
    await setDoc(doc(db, 'dhotis', 'inventory'), dhotiInventory);
    console.log('Dhoti inventory initialized successfully');
  } catch (error) {
    console.error('Error initializing dhoti inventory:', error);
  }
};

// Initialize global settings for dhoti and royal set options
export const initializeGlobalSettings = async () => {
  const globalSettings = {
    features: {
      kurtaDhotiEnabled: true,  // Global toggle for Kurta + Dhoti option
      kurtaDupattaEnabled: true, // Global toggle for Kurta + Dupatta option
      royalSetEnabled: true,    // Global toggle for Royal Set option
      dhotiManagementEnabled: true, // Enable dhoti management system
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: 'system'
  };

  try {
    await setDoc(doc(db, 'settings', 'global'), globalSettings);
    console.log('Global settings initialized successfully');
  } catch (error) {
    console.error('Error initializing global settings:', error);
  }
};

// Utility functions for dhoti inventory management
export const getDhotiInventory = async () => {
  try {
    const docRef = doc(db, 'dhotis', 'inventory');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No dhoti inventory found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching dhoti inventory:', error);
    return null;
  }
};

export const getGlobalSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No global settings found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching global settings:', error);
    return null;
  }
};

// Update dhoti inventory (reduce quantity when order is placed)
export const updateDhotiInventory = async (dhotiType, size, quantityToReduce = 1) => {
  try {
    const inventoryRef = doc(db, 'dhotis', 'inventory');
    const inventorySnap = await getDoc(inventoryRef);
    
    if (!inventorySnap.exists()) {
      throw new Error('Dhoti inventory not found');
    }
    
    const currentInventory = inventorySnap.data();
    const currentStock = currentInventory[dhotiType]?.inventory[size] || 0;
    
    if (currentStock < quantityToReduce) {
      throw new Error(`Insufficient dhoti stock. Available: ${currentStock}, Requested: ${quantityToReduce}`);
    }
    
    const newStock = currentStock - quantityToReduce;
    
    // Update the specific dhoti size inventory
    await setDoc(inventoryRef, {
      ...currentInventory,
      [dhotiType]: {
        ...currentInventory[dhotiType],
        inventory: {
          ...currentInventory[dhotiType].inventory,
          [size]: newStock
        }
      }
    });
    
    console.log(`Updated ${dhotiType} dhoti inventory for size ${size}: ${currentStock} -> ${newStock}`);
    return true;
  } catch (error) {
    console.error('Error updating dhoti inventory:', error);
    throw error;
  }
};

// Check if dhoti is available for a specific size
export const isDhotiAvailable = async (dhotiType, size, requestedQuantity = 1) => {
  try {
    const inventory = await getDhotiInventory();
    if (!inventory || !inventory[dhotiType]) {
      return false;
    }
    
    const availableStock = inventory[dhotiType].inventory[size] || 0;
    return availableStock >= requestedQuantity;
  } catch (error) {
    console.error('Error checking dhoti availability:', error);
    return false;
  }
};

// Get available dhoti styles for a given size
export const getAvailableDhtoisForSize = async (size) => {
  try {
    const inventory = await getDhotiInventory();
    if (!inventory) return [];
    
    const availableDhtois = [];
    
    for (const [dhotiType, dhotiData] of Object.entries(inventory)) {
      // Skip the metadata fields like lastUpdated, updatedBy
      if (dhotiType === 'lastUpdated' || dhotiType === 'updatedBy') continue;
      
      const stock = dhotiData.inventory[size] || 0;
      if (stock > 0) {
        availableDhtois.push({
          ...dhotiData,
          availableStock: stock
        });
      }
    }
    
    return availableDhtois;
  } catch (error) {
    console.error('Error getting available dhotis for size:', error);
    return [];
  }
};