import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import {
  uploadToCloudinary,
  extractPublicId,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.post("/avatar", upload.single("avatar"), async (req: any, res: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    // Get existing user to check for old avatar
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { avatar: true } as any,
    });

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(dataURI, "avatars");

    // If user has existing avatar, delete it from Cloudinary
    if (user && (user as any).avatar) {
      const publicId = extractPublicId((user as any).avatar);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Update user with new avatar URL
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: cloudinaryUrl } as any,
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
      } as any,
    });

    res.json({
      success: true,
      avatar: updatedUser.avatar,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    res.status(500).json({
      error: error.message || "Failed to upload avatar",
    });
  }
});

router.post("/post-image", upload.single("image"), async (req: any, res: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { postId } = req.body;

    // If postId is provided, verify ownership
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true, image: true } as any,
      });

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if ((post as any).authorId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Not authorized" });
      }

      // Delete old image if exists
      if ((post as any).image) {
        const publicId = extractPublicId((post as any).image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(dataURI, "posts");

    res.json({
      success: true,
      imageUrl: cloudinaryUrl,
    });
  } catch (error: any) {
    console.error("Post image upload error:", error);
    res.status(500).json({
      error: error.message || "Failed to upload post image",
    });
  }
});

export default router;
