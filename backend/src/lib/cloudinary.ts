import { v2 as cloudinary } from 'cloudinary';

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudinaryCloudName) {
  throw new Error('CLOUDINARY_CLOUD_NAME is not configured.');
}

if (!cloudinaryApiKey) {
  throw new Error('CLOUDINARY_API_KEY is not configured.');
}

if (!cloudinaryApiSecret) {
  throw new Error('CLOUDINARY_API_SECRET is not configured.');
}

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

export { cloudinary };
