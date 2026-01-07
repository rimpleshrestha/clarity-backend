import { Request, Response } from "express";
import { z } from "zod";
import uploadImageToCloudinary from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";

export const postSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty").max(1000),
});

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);
    const { content } = postSchema.parse(req.body);

    let imageUrl = null;
    if (req.file) {
      const result = await uploadImageToCloudinary(
        req.file.path,
        `post_${userId}_${Date.now()}`
      );
      imageUrl = result.secure_url;
    }

    const post = await prisma.post.create({
      data: {
        content,
        image: imageUrl,
        author_id: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, profile_picture: true },
        },
      },
    });

    return res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create post" });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);

    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, name: true, profile_picture: true },
        },
        likes: {
          where: { user_id: userId },
          select: { user_id: true },
        },
        _count: {
          select: { likes: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      likeCount: post._count.likes,
      likes: undefined, // Remove raw likes array
      _count: undefined,
    }));

    return res.status(200).json(formattedPosts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);
    const postId = Number(req.params.id);
    const { content } = postSchema.parse(req.body);
    let updateData: any = { content };

    console.log(postId, userId, req.file);
    if (req.file) {
      const cloudinaryResult = await uploadImageToCloudinary(
        req.file.path,
        `post_update_${postId}`
      );
      updateData.image = cloudinaryResult.secure_url;
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
        author_id: userId,
      },
      data: updateData,
      include: {
        author: {
          select: { name: true, profile_picture: true },
        },
      },
    });

    return res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error: any) {
    console.error("Update post error:", error);

    if (error.code === "P2025") {
      return res.status(403).json({
        message: "Unauthorized or post not found",
      });
    }

    return res.status(500).json({
      message: "Failed to update post",
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);
    const postId = Number(req.params.id);

    await prisma.post.delete({
      where: {
        id: postId,
        author_id: userId,
      },
    });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);
    const postId = Number(req.params.id);

    const existingLike = await prisma.like.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return res.status(200).json({ message: "Unliked", isLiked: false });
    }

    await prisma.like.create({
      data: {
        post_id: postId,
        user_id: userId,
      },
    });

    return res.status(201).json({ message: "Liked", isLiked: true });
  } catch (error) {
    return res.status(500).json({ message: "Toggle like failed" });
  }
};
