import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('Initializing Firebase Admin...');
console.log(`Target Project ID: ${firebaseConfig.projectId}`);
console.log(`Target Database ID: ${firebaseConfig.firestoreDatabaseId}`);

// Force the environment project ID to match our config
process.env.GOOGLE_CLOUD_PROJECT = firebaseConfig.projectId;

const APP_NAME = 'ai-studio-app';
let app: admin.app.App;

try {
  // Try to get the existing app if it was already initialized
  app = admin.app(APP_NAME);
  console.log(`Using existing Firebase Admin app: ${APP_NAME}`);
} catch (e) {
  // Initialize a new named app with the correct project ID
  app = admin.initializeApp({
    projectId: firebaseConfig.projectId,
  }, APP_NAME);
  console.log(`Initialized new Firebase Admin app: ${APP_NAME} with project ${firebaseConfig.projectId}`);
}

export const adminDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const adminAuth = admin.auth(app);

// Test connection
(async () => {
  try {
    console.log(`Testing connection to collection 'products' in database '${firebaseConfig.firestoreDatabaseId}'...`);
    const snapshot = await adminDb.collection('products').limit(1).get();
    console.log("Firestore connection test: SUCCESS. Found " + snapshot.size + " products.");
  } catch (error: any) {
    console.error("Firestore connection test: FAILED");
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}`);
    
    if (error.message.includes('Cloud Firestore API has not been used in project')) {
        const match = error.message.match(/project ([a-z0-9-]+)/);
        if (match) {
            console.error(`CRITICAL: Firestore is targeting project: ${match[1]}. Expected: ${firebaseConfig.projectId}`);
        }
    }
  }
})();

export default admin;
