import admin from "firebase-admin";
import { resolve } from "path";

// Path to your service account key file
const serviceAccountPath = resolve("firebaseServiceAccount.json");

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  storageBucket: "pscore-images.appspot.com", // Your Firebase Storage bucket name
});

const bucket = admin.storage().bucket();

export default bucket;

