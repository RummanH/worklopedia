const { promises: fsPromises } = require('fs');
const path = require('path');

const mime = require('mime-types');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFile = upload.single('file');

const generateUniqueFilename = (originalFilename) => {
  const fileExtension = originalFilename.split('.').pop() || 'txt';
  const randomString = uuidv4().substring(0, 8);
  const sanitizedFilename = originalFilename.replace(/[^\w\d_-]/gi, '');

  return `${sanitizedFilename}-${randomString}.${fileExtension}`;
};

const saveFileAsync = async (filename, fileBuffer) => {
  try {
    const publicDir = path.join(__dirname, '..', '..', 'public', 'uploads');
    await fsPromises.mkdir(publicDir, { recursive: true });

    await fsPromises.writeFile(path.join(publicDir, filename), fileBuffer);
  } catch (err) {
    throw err;
  }
};

const deleteFileAsync = async (filename) => {
  try {
    await fsPromises.unlink(path.join(__dirname, '..', '..', 'public', 'uploads', filename));
  } catch (err) {
    throw err;
  }
};

const saveFile = async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please provide a file to upload', 200));
  }

  const fileBuffer = req.file.buffer;
  const filename = generateUniqueFilename(req.file.originalname);
  // const mimeType = mime.lookup(req.file.originalname);

  // if (req.body.allowed) {
  //   const allowedArray = req.body.allowed.split(',').map((item) => item.trim());
  //   if (!allowedArray.includes(mimeType)) {
  //     console.log(mimeType);
  //   }
  // }

  await saveFileAsync(filename, fileBuffer);
  sendResponse({
    statusCode: 200,
    status: 'success',
    payload: { filename },
    success: true,
    message: 'File uploaded successfully.',
    res,
  });
};

module.exports = {
  uploadFile,
  saveFile,
};
