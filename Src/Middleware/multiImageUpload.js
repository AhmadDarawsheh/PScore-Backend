import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bucket from "./firebaseConfig.js";

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
  { name: "photos", maxCount: 4 }, // Accept up to 4 files with the field name 'photos'
]);

// Middleware to handle file upload
const uploadMiddleware = (req, res, next) => {
  try {
    // Check if files are uploaded
    if (!req.files || !req.files.photos || req.files.photos.length === 0) {
      return next(); // If no files, proceed to next middleware
    }

    // Array to store file URLs
    const fileUrls = [];

    // Process each uploaded file asynchronously
    Promise.all(
      req.files.photos.map(async (file) => {
        const uniqueFilename = uuidv4() + path.extname(file.originalname);
        const fileUpload = bucket.file(uniqueFilename);

        // Create a writable stream to Firebase Storage
        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        // Handle stream events
        await new Promise((resolve, reject) => {
          stream.on("error", (err) => {
            console.error("Error uploading file:", err);
            reject("Failed to upload to Firebase Storage.");
          });

          stream.on("finish", async () => {
            try {
              // Make the file publicly accessible
              await fileUpload.makePublic();

              // Get the file URL
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
              fileUrls.push(publicUrl); // Store the file URL
              resolve(); // Resolve promise after successful upload
            } catch (error) {
              console.error("Error storing file URL:", error);
              reject("Failed to store file URL.");
            }
          });

          // End the stream with the file buffer
          stream.end(file.buffer);
        });
      })
    )
      .then(() => {
        // Attach the file URLs to the request object
        req.fileUrls = fileUrls;
        next(); // Proceed to the next middleware or route handler
      })
      .catch((error) => {
        console.error("Promise.all error:", error);
        return res.status(500).send("Something went wrong.");
      });
  } catch (error) {
    console.error("Middleware error:", error);
    return res.status(500).send("Something went wrong.");
  }
};

export { upload, uploadMiddleware };
