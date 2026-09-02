import admin from "firebase-admin";
import { createRequire } from "module"; // 1. Import createRequire

// 2. Create a require function to load JSON files safely
const require = createRequire(import.meta.url);

// 3. Load the service account key using require() instead of import
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin SDK
// We check admin.apps.length to prevent "App already exists" errors during hot reloads
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();

/**
 * Sends a notification to the 'notifications' collection in Firestore.
 * The frontend listens to this collection in real-time.
 */
export const sendNotification = async (userId, title, message, type) => {
  try {
    await db.collection("notifications").add({
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`🔔 Notification sent to ${userId}: ${title}`);
  } catch (error) {
    console.error("❌ Notification Error:", error.message);
  }
};