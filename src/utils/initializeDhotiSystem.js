// Initialize Centralized Dhoti System
// Run this script once to set up the centralized dhoti inventory and global settings in Firebase

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  // Add your Firebase config here
  // apiKey: "your-api-key",
  // authDomain: "your-auth-domain",
  // projectId: "your-project-id",
  // storageBucket: "your-storage-bucket",
  // messagingSenderId: "your-messaging-sender-id",
  // appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize dhoti inventory with default data
const initializeDhotiInventory = async () => {
  const dhotiInventory = {
    white: {
      id: 'white',
      name: 'White',
      // Update with actual image URLs from your Cloudinary
      image: 'https://res.cloudinary.com/di6unrpjw/image/upload/v1737398143/white-dhoti.jpg',
      inventory: {
        XS: 5,
        S: 10,
        M: 10, 
        L: 0  // L size not available initially
      }
    },
    black: {
      id: 'black',
      name: 'Black',
      image: 'https://res.cloudinary.com/di6unrpjw/image/upload/v1737398143/black-dhoti.jpg',
      inventory: {
        XS: 0, // Set according to your requirement
        S: 5,  // Set according to your requirement
        M: 0,  // Set according to your requirement
        L: 0   // L size not available initially
      }
    },
    gold: {
      id: 'gold',
      name: 'Gold',
      image: 'https://res.cloudinary.com/di6unrpjw/image/upload/v1737398143/gold-dhoti.jpg',
      inventory: {
        XS: 0, // Set according to your requirement
        S: 0,  // Set according to your requirement
        M: 0,  // Set according to your requirement
        L: 0   // L size not available initially
      }
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: 'initialization-script'
  };

  try {
    // Check if dhoti inventory already exists
    const inventoryRef = doc(db, 'dhotis', 'inventory');
    const inventorySnap = await getDoc(inventoryRef);
    
    if (inventorySnap.exists()) {
      console.log('✅ Dhoti inventory already exists. Skipping initialization.');
      return;
    }
    
    await setDoc(inventoryRef, dhotiInventory);
    console.log('✅ Dhoti inventory initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing dhoti inventory:', error);
  }
};

// Initialize global settings
const initializeGlobalSettings = async () => {
  const globalSettings = {
    features: {
      kurtaDhotiEnabled: true,   // Enable Kurta + Dhoti option by default
      kurtaDupattaEnabled: true, // Enable Kurta + Dupatta option by default
      royalSetEnabled: true,     // Enable Royal Set option by default
      dhotiManagementEnabled: true, // Enable dhoti management system
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: 'initialization-script'
  };

  try {
    // Check if global settings already exist
    const settingsRef = doc(db, 'settings', 'global');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      console.log('✅ Global settings already exist. Skipping initialization.');
      return;
    }
    
    await setDoc(settingsRef, globalSettings);
    console.log('✅ Global settings initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing global settings:', error);
  }
};

// Main initialization function
const initializeCentralizedDhotiSystem = async () => {
  console.log('🚀 Initializing centralized dhoti system...');
  
  try {
    await initializeDhotiInventory();
    await initializeGlobalSettings();
    
    console.log('🎉 Centralized dhoti system initialization complete!');
    console.log('📋 Summary:');
    console.log('   - Dhoti inventory created with White (25 units), Black (5 units), Gold (0 units)');
    console.log('   - Global settings enabled for Kurta+Dhoti and Royal Set options');
    console.log('   - Admin can now manage dhoti inventory and global settings');
    console.log('   - Frontend will fetch dhoti options from centralized system');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
  }
};

// Run the initialization
initializeCentralizedDhotiSystem();

export { initializeCentralizedDhotiSystem, initializeDhotiInventory, initializeGlobalSettings };