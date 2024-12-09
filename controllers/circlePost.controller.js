import CirclePost from "../models/circlePost.model.js";
import Comment from "../models/comment.model.js";
import CommentReply from "../models/commentReply.model.js";

export const createCirclePost = async (req, res) => {
  try {
    const { user, circle, content, theme, linkedItems, videoUrl, images, title } = req.body;

    // Create a new post with the images array
    const newPost = await CirclePost.create({
      user,
      circle,
      content,
      theme,
      linkedItems,
      videoUrl,
      images,
      title
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCirclePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user, content, theme, linkedItems, videoUrl, images, title } = req.body;

    // Find the post by ID
    const post = await CirclePost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure the user is the author of the post
    if (post.user.toString() !== user) {
      return res.status(403).json({ message: "You are not authorized to update this post." });
    }

    // Update post details, including images array
    post.content = content || post.content;
    post.theme = theme || post.theme;
    post.linkedItems = linkedItems || post.linkedItems;
    post.videoUrl = videoUrl || post.videoUrl;
    post.images = images || post.images;
    post.title = title || post.title

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCirclePost = async (req, res) => {
  try {
    const { postId, userId } = req.params;

    // Find the post by ID
    const post = await CirclePost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure the user is the author of the post
    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this post." });
    }

    // Delete the post
    await CirclePost.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostsByCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { theme, page = 1, limit = 10 } = req.query;

    const filter = { circle: circleId };
    if (theme) filter.theme = theme;

    // Pagination
    const posts = await CirclePost.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("user") // Populate user details
      .sort({ createdAt: -1 }); // Sort by latest posts

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Pagination
    const posts = await CirclePost.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("circle") // Populate circle details
      .sort({ createdAt: -1 }); // Sort by latest posts

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostWithCommentsAndReplies = async (req, res) => {
  try {
    const { postId } = req.params;

    // Step 1: Find the post without embedding a comments array
    const post = await CirclePost.findById(postId).populate("user");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Step 2: Find all comments related to the post
    const comments = await Comment.find({ post: postId }).populate("author").lean();

    // Step 3: For each comment, find and attach its replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await CommentReply.find({ parentComment: comment._id })
          .populate("author")
          .lean();

        return {
          ...comment, // Spread the comment fields
          replies, // Attach the populated replies
        };
      })
    );

    // Step 4: Construct the final response with the post and its comments with replies
    const postWithCommentsAndReplies = {
      ...post.toObject(), // Convert the post to a plain object
      comments: commentsWithReplies, // Add comments with replies
    };

    res.status(200).json(postWithCommentsAndReplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await CirclePost.findById(postId);

    if (!post.likedBy.includes(userId)) {
      post.likedBy.push(userId);
      post.likes += 1;
      await post.save();
      return res.status(200).json(post);
    } else {
      return res.status(400).json({ message: "User already liked this post" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await CirclePost.findById(postId);

    if (post.likedBy.includes(userId)) {
      post.likedBy = post.likedBy.filter((id) => id.toString() != userId);
      post.likes -= 1;
      await post.save();
      return res.status(200).json(post);
    } else {
      return res.status(400).json({ message: "User has not liked this post" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
