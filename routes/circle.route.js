import express from "express";
import {
  createCircle,
  updateCircle,
  addMemberToCircle,
  removeMemberFromCircle,
  getMembersOfCircle,
  getUserCircles,
  getCircleWithOwner,
  getAllCirclesWithOwners,
  getCircleWithMembersAndOwner,
} from "../controllers/circle.controller.js";

const router = express.Router();

// Create a new circle
router.post("/", createCircle);

// Update circle details (requires owner authorization)
router.put("/:circleId", updateCircle);

// Add a member to a circle
router.post("/:circleId/members/:userId", addMemberToCircle);

// Remove a member from a circle (only owner or user can remove)
router.delete("/:circleId/members/:userId/:requesterId", removeMemberFromCircle);

// Get all members of a circle
router.get("/:circleId/members", getMembersOfCircle);

// Get all circles a user belongs to
router.get("/user/:userId", getUserCircles);

// Get a specific circle with owner information
router.get("/:circleId/with-owner", getCircleWithOwner);

// Get all circles with each circle’s owner details
router.get("/with-owners", getAllCirclesWithOwners);

// Get a circle with both owner and members
router.get("/:circleId/with-members-and-owner", getCircleWithMembersAndOwner);

export default router;
