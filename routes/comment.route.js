import express from "express";
import {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByPost,
  likeComment,
  unlikeComment
} from "../controllers/comment.controller.js";

const router = express.Router();

// Create a new comment on a post
router.post("/", createComment);

// Update a specific comment
router.put("/:commentId", updateComment);

//Increase like
router.post("/:commentId/like", likeComment);

// Delete a specific comment
router.delete("/:commentId/:userId", deleteComment);

// Get all comments for a specific post
router.get("/post/:postId", getCommentsByPost);

router.post("/:commentId/unlike", unlikeComment);


export default router;
