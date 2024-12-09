import express from "express";
import {
  createCirclePost,
  updateCirclePost,
  deleteCirclePost,
  getPostsByCircle,
  getPostsByUser,
  getPostWithCommentsAndReplies,
  likePost,
  unlikePost,
} from "../controllers/circlePost.controller.js";

const router = express.Router();

// Create a new post in a circle
router.post("/", createCirclePost);

// Update a specific post (only the author can update)
router.put("/:postId", updateCirclePost);

// Delete a specific post (only the author can delete)
router.delete("/:postId/:userId", deleteCirclePost);

// Get all posts in a specific circle with optional theme filter and pagination
router.get("/circle/:circleId", getPostsByCircle);

// Get all posts by a specific user with pagination
router.get("/user/:userId", getPostsByUser);

// Get a single post with its comments and replies (for detailed view)
router.get("/:postId/details", getPostWithCommentsAndReplies);

// Like a post
router.post("/:postId/like", likePost);

// Unlike a post
router.post("/:postId/unlike", unlikePost);

export default router;
