import { v2 as cloudinary } from "cloudinary";

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadToCloudinary = async (
  filePath: string,
  folder: string = "avatars"
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: "auto" },
        { format: "auto" },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    // Don't throw - deletion failures shouldn't break the flow
  }
};

export const extractPublicId = (url: string): string | null => {
  try {
    const match = url.match(/\/([^/]+)\.[^.]+$/);
    if (match) {
      const parts = url.split("/");
      const folderIndex = parts.findIndex((p) => p === "avatars");
      if (folderIndex !== -1 && folderIndex < parts.length - 1) {
        const filename = parts[parts.length - 1].split(".")[0];
        return `avatars/${filename}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};
