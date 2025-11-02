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
  folder: string = "avatars",
  transformations?: any[]
): Promise<string> => {
  try {
    const defaultTransformations =
      folder === "posts"
        ? [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" },
            { format: "auto" },
          ]
        : [
            { width: 400, height: 400, crop: "fill" },
            { quality: "auto" },
            { format: "auto" },
          ];

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      transformation: transformations || defaultTransformations,
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
  }
};

export const extractPublicId = (url: string): string | null => {
  try {
    const parts = url.split("/");
    const folderIndex = parts.findIndex(
      (p) => p === "avatars" || p === "posts"
    );
    if (folderIndex !== -1 && folderIndex < parts.length - 1) {
      const folder = parts[folderIndex];
      const filename = parts[parts.length - 1].split(".")[0];
      return `${folder}/${filename}`;
    }
    return null;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};
