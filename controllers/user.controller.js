import mongoose from "mongoose";
import Fabric from "../models/fabric.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account"));
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          displayName: req.body.displayName,
          email: req.body.email,
          password: req.body.password,
          profileImage: req.body.profileImage,
          unit: req.body.unit,
          currency: req.body.currency,
          bio: req.body.bio,
          city: req.body.city,
          country: req.body.country,
          bust: req.body.bust,
          waist: req.body.waist,
          hip: req.body.hip,
          height: req.body.height,
          bodyDimensionsUnit: req.body.bodyDimensionsUnit,
          skillLevel: req.body.skillLevel,
          preferredSewingStyles: req.body.preferredSewingStyles,
          sewingMachinesAndTools: req.body.sewingMachinesAndTools,
          isPrivate: req.body.isPrivate,
        },
      },
      { new: true }
    );
    const { password, ...restDetails } = updateUser._doc;
    res.status(200).json(restDetails);
  } catch (error) {
    next(error);
  }
};

export const getFabricList = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const fabricList = await Fabric.find({ userRef: req.params.id });
      res.status(200).json(fabricList);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own fabric stash"));
  }
};

export const searchUsers = async (req, res, next) => {
  const searchQuery = req.query.query;
  if (!searchQuery) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const users = await User.find({
      displayName: { $regex: searchQuery, $options: "i" },
    })
      .select("-password")
      .sort({
        displayName: 1,
      })
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const viewProfile = async (req, res, next) => {
  const { user_id, profile_id } = req.params;

  console.log(user_id + "test" + profile_id);
  try {
    const userProfile = await User.findById(profile_id).select("-password");

    console.log(userProfile);
    if (!userProfile) {
      return next(errorHandler(404, "User not found"));
    }

    // Check if the logged-in user is following the profile
    //const isFollowing = userProfile.followers.includes(user_id); // Assuming `followers` is an array of user IDs in the User model

    /*if (!isFollowing) {
      return next(
        errorHandler(403, "You do not have permission to view this profile")
      ); // Handle access denial
    }*/

    res.status(200).json(userProfile);
  } catch (error) {
    next(error);
  }
};

export const viewFollowers = async (req, res, next) => {
  const { user_id, profile_id } = req.params;

  try {
    const userProfile = await User.findById(profile_id).select("followers");

    if (!userProfile) {
      return next(errorHandler(404, "User not found"));
    }

    const followers = await Promise.all(
      userProfile.followers.map((followerId) => {
        return User.findById(followerId);
      })
    );
    let followerList = [];
    followers.map((follower) => {
      let followers = {};
      followers = {
        displayName: follower.displayName,
        profileImage: follower.profileImage,
        _id: follower._id,
      };
      followerList.push(followers);
    });

   res.status(200).json(followerList);
  }  catch (error) {
    next(error);
  }
};

export const viewFollowing = async (req, res, next) => {
  const { user_id, profile_id } = req.params;

  try {
    const userProfile = await User.findById(profile_id).select("following");

    if (!userProfile) {
      return next(errorHandler(404, "User not found"));
    }

    const following = await Promise.all(
      userProfile.following.map((followingId) => {
        return User
          .findById(followingId);
      })
    );
    let followingList = [];
    following.map((follow) => {
      let following = {};
      following = {
        displayName: follow.displayName,
        profileImage: follow.profileImage,
        _id: follow._id,
      };
      followingList.push(following);
    });

    res.status(200).json(followingList);
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      const followers = await Promise.all(
        user.followers.map((followerId) => {
          return User.findById(followerId);
        })
      );
      let followerList = [];
      followers.map((follower) => {
        let followers = {};
        followers = {
          displayName: follower.displayName,
          profileImage: follower.profileImage,
          _id: follower._id,
        };
        followerList.push(followers);
      });
      res.status(200).json(followerList);
    } catch (error) {
      next(error);
    }
  };

export const getFollowing = async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      let following = {};
      following = await Promise.all(
        user.following.map((followingId) => {
          return User.findById(followingId);
        })
      );
      let usersFollowed = [];
      following.map((follow) => {
        let userFollowed = {};
        userFollowed = {
          displayName: follow.displayName,
          profileImage: follow.profileImage,
          _id: follow._id,
        };
       usersFollowed.push(userFollowed);
      });
      res.status(200).json(usersFollowed);
    } catch (error) {
      next(error);
    }
  };

export const removeFollower = async (req, res, next) => {
    if (req.user.id === req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const otherUser = await User.findById(req.body.userId);
        if (!user.followers.includes(req.body.userId) && !otherUser.following.includes(req.params.id)) {
          return next(errorHandler(400, "You are not being followed by this user"));
        }
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await otherUser.updateOne({ $pull: { following: req.params.id } });
        const updatedUser = await User.findById(req.params.id);
        res.status(200).json({
          message: "You have removed this follower",
          updatedFollowers: updatedUser.followers,
          updatedFollowing: updatedUser.following
        });

      } catch (error) {
        next(error);
      }
    } else {
      return next(errorHandler(401, "You can only remove followers who follow you"));
    }
  };

export const unfollowUser = async (req, res, next) => {
    if (req.user.id === req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const otherUser = await User.findById(req.body.userId);
        if (!user.following.includes(req.body.userId) && !otherUser.followers.includes(req.params.id)) {
          return next(errorHandler(400, "You do not follow this user"));
        }
        await user.updateOne({ $pull: { following: req.body.userId } });
        await otherUser.updateOne({ $pull: { followers: req.params.id } });
        const updatedUser = await User.findById(req.params.id);
        res.status(200).json({
          message: "You have unfollowed this user",
          updatedFollowing: updatedUser.following,
          updatedFollowers: updatedUser.followers
        });
      } catch (error) {
        next(error);
      }
    } else {
      return next(errorHandler(401, "You can only unfollow users you follow"));
    }
  }

export const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);

    const preferredSewingStyles = currentUser.preferredSewingStyles;
    const following = currentUser.following.map((id) => new mongoose.Types.ObjectId(id));

    let suggestedUsers;

    if(preferredSewingStyles && preferredSewingStyles.length > 0) {
      suggestedUsers = await User.aggregate([
        {
          $match: {
            _id: {
              $nin: [...following, currentUser._id],
            },
            preferredSewingStyles: {
              $in: preferredSewingStyles,
            },
          },
        },
        {
          $project: {
            _id: 1,
            displayName: 1,
            profileImage: 1,
          },
        },
      ])
      console.log(suggestedUsers);
    }
    if (!suggestedUsers || suggestedUsers.length === 0) {
      suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { 
            $nin: [...following, currentUser._id],
          },
        },
      },
      {
        $project: {
          _id: 1,
          displayName: 1,
          profileImage: 1,
        },
      },
    ]);
    }
    console.log(suggestedUsers);
    res.status(200).json(suggestedUsers);
  } catch (error) {
    next(error);
  }
};

export const followOtherUser = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const otherUser = await User.findById(req.body.userId);
      if (user.following.includes(req.body.userId) && otherUser.followers.includes(req.params.id)) {
        return next(errorHandler(400, "You already follow this user"));
      }
      await user.updateOne({ $push: { following: req.body.userId } });
      await otherUser.updateOne({ $push: { followers: req.params.id } });
      res.status(200).json("You are now following this user!");
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only follow from your own account"));
  }
};

export const getUserById = async(req, res, next) => {
  const { user_id } = req.params;
  try {
    const targetUser = await User.findById(user_id)

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" }); 
    }

    res.status(200).json(targetUser); 
  } catch(e) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
}

