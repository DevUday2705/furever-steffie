import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
let db;

// Initialize Firestore only once
if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    initializeApp({
        credential: cert({
            ...serviceAccount,
            private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
    });

    db = getFirestore();
} else {
    db = getFirestore();
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST method allowed" });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items,
            amount,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !customer || !items || !amount) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check and update stock for XS, S, M sizes
        const batch = db.batch();
        const stockUpdates = [];

        console.log("📦 Processing items for stock check:", JSON.stringify(items, null, 2));

        for (const item of items) {
            console.log(`🔍 Checking item: ${item.name}, Size: ${item.selectedSize}, Category: ${item.category || item.subcategory || item.type}`);
            
            if (['XS', 'S', 'M'].includes(item.selectedSize)) {
                // Try different collection name patterns
                let collectionName = item.category || item.subcategory || item.type;
                
                // Handle known collection mappings
                const collectionMap = {
                    'kurta': 'kurtas',
                    'lehenga': 'lehengas', 
                    'frock': 'frocks',
                    'bandana': 'bandanas',
                    'bowtie': 'bowties'
                };
                
                // Use mapped name or add 's' if needed
                if (collectionMap[collectionName]) {
                    collectionName = collectionMap[collectionName];
                } else if (collectionName && !collectionName.endsWith('s')) {
                    collectionName += 's';
                }
                
                console.log(`📁 Using collection: ${collectionName}, Product ID: ${item.productId}`);
                
                const productRef = db.collection(collectionName).doc(item.productId);
                const productDoc = await productRef.get();

                if (!productDoc.exists) {
                    console.error(`❌ Product not found: ${item.productId} in collection ${collectionName}`);
                    
                    // Try alternative collection names
                    const alternativeCollections = ['kurtas', 'lehengas', 'frocks', 'bandanas', 'bowties'];
                    let found = false;
                    
                    for (const altCollection of alternativeCollections) {
                        try {
                            const altRef = db.collection(altCollection).doc(item.productId);
                            const altDoc = await altRef.get();
                            
                            if (altDoc.exists) {
                                console.log(`✅ Found product in alternative collection: ${altCollection}`);
                                const product = altDoc.data();
                                const currentStock = product.sizeStock?.[item.selectedSize] || 0;
                                const requestedQty = item.quantity || 1;

                                console.log(`📋 Stock check - Size: ${item.selectedSize}, Current: ${currentStock}, Requested: ${requestedQty}`);

                                if (currentStock < requestedQty) {
                                    return res.status(400).json({
                                        message: `Insufficient stock for size ${item.selectedSize}. Available: ${currentStock}, Requested: ${requestedQty}`
                                    });
                                }

                                stockUpdates.push({
                                    ref: altRef,
                                    size: item.selectedSize,
                                    newStock: currentStock - requestedQty,
                                    productId: item.productId,
                                    collectionName: altCollection
                                });
                                
                                found = true;
                                break;
                            }
                        } catch (err) {
                            console.log(`Failed to check collection ${altCollection}:`, err.message);
                        }
                    }
                    
                    if (!found) {
                        return res.status(400).json({
                            message: `Product ${item.productId} not found in any collection`
                        });
                    }
                } else {
                    const product = productDoc.data();
                    console.log(`📊 Product data:`, JSON.stringify(product.sizeStock, null, 2));
                    
                    const currentStock = product.sizeStock?.[item.selectedSize] || 0;
                    const requestedQty = item.quantity || 1;

                    console.log(`📋 Stock check - Size: ${item.selectedSize}, Current: ${currentStock}, Requested: ${requestedQty}`);

                    if (currentStock < requestedQty) {
                        return res.status(400).json({
                            message: `Insufficient stock for size ${item.selectedSize}. Available: ${currentStock}, Requested: ${requestedQty}`
                        });
                    }

                    // Prepare stock update
                    stockUpdates.push({
                        ref: productRef,
                        size: item.selectedSize,
                        newStock: currentStock - requestedQty,
                        productId: item.productId,
                        collectionName: collectionName
                    });
                }
            }
        }

        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

        const orderData = {
            orderNumber,
            razorpay_order_id,
            razorpay_payment_id,
            customer,
            items, // Should contain: productId, name, selectedSize, price, quantity, etc.
            amount,
            orderSource: items.length > 1 ? "cart" : "buy-now",
            paymentStatus: "paid",
            orderStatus: "pending",
            createdAt: new Date().toISOString(),
        };

        console.log(`🔄 Creating order with number: ${orderNumber}`);
        console.log(`📋 Order data:`, JSON.stringify(orderData, null, 2));

        // Save order and update stock in a batch
        const orderRef = db.collection("orders").doc();
        batch.set(orderRef, orderData);

        console.log(`💾 Added order to batch with ID: ${orderRef.id}`);

        // Add stock updates to batch
        for (const update of stockUpdates) {
            console.log(`📦 Adding stock update to batch: ${update.productId} - ${update.size} -> ${update.newStock}`);
            batch.update(update.ref, {
                [`sizeStock.${update.size}`]: update.newStock
            });
        }

        console.log(`🚀 Committing batch with ${stockUpdates.length} stock updates...`);
        
        try {
            // Commit all changes atomically
            await batch.commit();
            console.log(`✅ Batch committed successfully!`);

            return res.status(200).json({
                success: true,
                orderId: orderRef.id,
                orderNumber,
                stockUpdated: stockUpdates.map(u => ({
                    productId: u.productId,
                    size: u.size,
                    newStock: u.newStock,
                    collection: u.collectionName
                }))
            });
        } catch (batchError) {
            console.error("❌ Batch commit failed:", batchError);
            
            // Try to save order without stock update as fallback
            try {
                console.log("🔄 Attempting to save order without stock update...");
                const fallbackOrderRef = await db.collection("orders").add(orderData);
                
                return res.status(200).json({
                    success: true,
                    orderId: fallbackOrderRef.id,
                    orderNumber,
                    warning: "Order saved but stock may not be updated",
                    stockUpdated: []
                });
            } catch (fallbackError) {
                console.error("❌ Fallback order save also failed:", fallbackError);
                throw fallbackError;
            }
        }
    } catch (error) {
        console.error("❌ Failed to save order to Firestore:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while saving order",
        });
    }
}
