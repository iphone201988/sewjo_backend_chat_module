import express from "express";
import {
  getFabricList,
  updateUser, getFollowers, removeFollower, unfollowUser, getFollowing, getSuggestedUsers, followOtherUser,
  searchUsers,
  viewProfile,
  viewFollowers,
  viewFollowing,
  getUserById,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/:id/update", verifyToken, updateUser);
router.get("/:id/fabriclist", verifyToken, getFabricList);
router.get("/search", verifyToken, searchUsers);
router.get("/:user_id/viewProfile/:profile_id", verifyToken, viewProfile);
router.get("/:user_id/viewFollowers/:profile_id", verifyToken, viewFollowers);
router.get("/:user_id/viewFollowing/:profile_id", verifyToken, viewFollowing);
router.get("/:id/getFollowers", verifyToken, getFollowers);
router.post("/:id/removeFollower", verifyToken, removeFollower);
router.post("/:id/unfollow", verifyToken, unfollowUser);
router.get("/:id/getFollowing", verifyToken, getFollowing);
router.get("/:id/suggestedUsers", verifyToken, getSuggestedUsers);
router.post("/:id/follow", verifyToken, followOtherUser);
router.get("/getUserById/:user_id", verifyToken, getUserById);


export default router;
