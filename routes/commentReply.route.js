import express from "express";
import {
  createCommentReply,
  updateCommentReply,
  deleteCommentReply,
  getRepliesByComment,
  likeCommentReply,
  unlikeCommentReply
} from "../controllers/commentReply.controller.js";

const router = express.Router();

// Create a new reply to a comment
router.post("/", createCommentReply);

// Update a specific reply
router.put("/:replyId", updateCommentReply);

// Delete a specific reply
router.delete("/:replyId/:userId", deleteCommentReply);

// Get all replies for a specific comment
router.get("/comment/:commentId", getRepliesByComment);

router.post("/replies/:replyId/like", likeCommentReply);

router.post("/replies/:replyId/unlike", unlikeCommentReply);


export default router;
