import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bucket from "./firebaseConfig.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadMiddleware = async (req, res, next) => {
  try {
    if (!req.file) {
      //  res.status(400).json("No file uploaded.");
      return next();
    }

    const file = req.file;
    const uniqueFilename = uuidv4() + path.extname(file.originalname);

    const fileUpload = bucket.file(uniqueFilename);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on("error", (err) => {
      console.error(err);
      return res.status(500).send("Failed to upload to Firebase Storage.");
    });

    stream.on("finish", async () => {
      try {
        // Make the file publicly accessible
        await fileUpload.makePublic();

        // Get the file URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

        // Attach the file URL to the request object
        req.fileUrl = publicUrl;
        next(); // Call the next middleware or route handler
      } catch (error) {
        console.error(error);
        return res.status(500).send("Failed to store file URL.");
      }
    });

    stream.end(file.buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong.");
  }
};

export { upload, uploadMiddleware };
