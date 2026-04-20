import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (base64Image: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'elite-store/products',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1570975164/sample.jpg
    // Example with folder: https://res.cloudinary.com/cloud_name/image/upload/v123/elite-store/products/some_id.jpg
    
    // Regex to match the part after /upload/v<digits>/ and before the extension
    const regex = /\/upload\/v\d+\/(.+)\.[a-z]+$/;
    const match = imageUrl.match(regex);
    
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId);
    } else {
      // Fallback for URLs without version number
      const parts = imageUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const publicIdWithExtension = lastPart.split('.')[0];
      const publicId = `elite-store/products/${publicIdWithExtension}`;
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    // We don't throw here to avoid blocking product deletion if image deletion fails
  }
};
