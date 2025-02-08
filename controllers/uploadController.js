import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).fields([
    { name: 'singleImage', maxCount: 1 },
    { name: 'multipleImage', maxCount: 10 },
]);

// Function to check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only! Please upload JPEG, JPG, PNG, or GIF file formats.');
    }
}

// Handle image upload
export const uploadImage = (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                // Error if user uploads more files than allowed
                res.status(400).json({ message: `Exceeded the limit for uploading images. Allowed: 1 for singleImage, 10 for multipleImage` });
            } else {
                res.status(500).json({ message: `Multer error: ${err.message}` });
            }
        } else if (err) {
            // An unknown error occurred when uploading.
            res.status(500).json({ message: `Upload error: ${err}` });
        } else {
            // Check if no files were uploaded
            if (!req.files || (req.files.singleImage?.length === 0 && req.files.multipleImage?.length === 0)) {
                res.status(400).json({ message: 'No files selected! Please select at least one file.' });
            } else {
                // Prepare the response data
                const responseData = {};

                // Single Image
                if (req.files.singleImage) {
                    responseData.singleImage = `uploads/${req.files.singleImage[0].filename}`;
                }

                // Multiple Images
                if (req.files.multipleImage) {
                    responseData.multipleImages = req.files.multipleImage.map(file => `uploads/${file.filename}`);
                }

                res.json({
                    message: 'Files uploaded!',
                    data: responseData
                });
            }
        }
    });
};
