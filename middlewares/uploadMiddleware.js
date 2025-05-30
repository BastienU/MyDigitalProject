const multer = require('multer');
const path = require('path');

// Temporary storage for uploaded files
const storage = multer.memoryStorage();

// Define file filter
const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname) !== '.csv') {
    return cb(new Error('Seuls les fichiers CSV sont autorisés.'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;