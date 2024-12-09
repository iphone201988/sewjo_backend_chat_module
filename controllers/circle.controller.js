import Circle from "../models/circle.model.js";
import CircleMembership from "../models/circleMembership.model.js";

export const getCircleWithOwner = async (req, res) => {
    try {
      const { circleId } = req.params;
  
      // Find the circle and populate the owner field with selected user details
      const circle = await Circle.findById(circleId).populate("owner");
  
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }
  
      res.status(200).json(circle);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

export const createCircle = async (req, res) => {
  try {
    const { name, description, privacy, owner } = req.body;

    // Check if a circle with the same name already exists
    const existingCircle = await Circle.findOne({ name });
    if (existingCircle) {
      return res.status(400).json({ message: "A circle with this name already exists." });
    }

    // Create the circle
    const newCircle = await Circle.create({
      name,
      description,
      privacy,
      owner,
    });

    // Automatically add the owner as a member
    await CircleMembership.create({
      circle: newCircle._id,
      user: owner,
    });

    res.status(201).json(newCircle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateCircle = async (req, res) => {
    try {
      const { circleId } = req.params;
      const { name, description, privacy, owner } = req.body;
  
      // Find the circle by ID and check if the owner is updating
      const circle = await Circle.findById(circleId);
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }
      if (circle.owner.toString() !== owner) {
        return res.status(403).json({ message: "Only the circle owner can update details." });
      }
  
      // Update circle details
      circle.name = name || circle.name;
      circle.description = description || circle.description;
      circle.privacy = privacy || circle.privacy;
      await circle.save();
  
      res.status(200).json(circle);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  
export const addMemberToCircle = async (req, res) => {
try {
    const { circleId, userId } = req.params;

    // Check if the user is already a member
    const existingMembership = await CircleMembership.findOne({ circle: circleId, user: userId });
    if (existingMembership) {
    return res.status(400).json({ message: "User is already a member of this circle." });
    }

    // Add the user as a member
    const membership = await CircleMembership.create({
    circle: circleId,
    user: userId,
    });

    res.status(201).json(membership);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};

  
export const removeMemberFromCircle = async (req, res) => {
try {
    const { circleId, userId, requesterId } = req.params;

    // Check if the circle exists
    const circle = await Circle.findById(circleId);
    if (!circle) {
    return res.status(404).json({ message: "Circle not found" });
    }

    // Only allow the circle owner or the user themselves to remove the member
    if (circle.owner.toString() !== requesterId && userId !== requesterId) {
    return res.status(403).json({ message: "Unauthorized to remove member." });
    }

    // Remove the member
    const result = await CircleMembership.findOneAndDelete({ circle: circleId, user: userId });
    if (!result) {
    return res.status(404).json({ message: "Member not found in this circle." });
    }

    res.status(200).json({ message: "Member removed successfully" });
} catch (error) {
    res.status(500).json({ message: error.message });
}
};

//get all members of a circle
export const getMembersOfCircle = async (req, res) => {
try {
    const { circleId } = req.params;

    // Find all memberships for the specified circle and populate user details
    const memberships = await CircleMembership.find({ circle: circleId }).populate("user");

    // Extract user information from memberships
    const members = memberships.map((membership) => membership.user);

    res.status(200).json(members);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};
  

export const getUserCircles = async (req, res) => {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;
  
      // Check if page or limit parameters are provided
      if (page && limit) {
        // Paginated request
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
  
        // Find memberships for the specified user with pagination
        const memberships = await CircleMembership.find({ user: userId })
          .populate("circle")
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum);
  
        // Extract circle information from memberships
        const circles = memberships.map((membership) => membership.circle);
  
        // Count total memberships for pagination info
        const totalCircles = await CircleMembership.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalCircles / limitNum);
  
        return res.status(200).json({
          circles,
          currentPage: pageNum,
          totalPages,
        });
      } else {
        // Non-paginated request: return all circles
        const memberships = await CircleMembership.find({ user: userId }).populate("circle");
  
        // Extract circle information
        const circles = memberships.map((membership) => membership.circle);
  
        return res.status(200).json({ circles });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  


  export const getAllCirclesWithOwners = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
  
      // Convert page and limit to integers
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
  
      // Build a search filter based on the `search` query parameter
      const searchFilter = search
        ? { name: { $regex: search, $options: "i" } } // Case-insensitive search on circle name
        : {};
  
      // Query circles with pagination, search filter, and owner population
      const circles = await Circle.find(searchFilter)
        .populate("owner") // Populate the owner details
        .skip((pageNum - 1) * limitNum) // Skip circles from previous pages
        .limit(limitNum); // Limit the results to the specified number per page
  
      // Count total circles matching the search filter for pagination
      const totalCircles = await Circle.countDocuments(searchFilter);
      const totalPages = Math.ceil(totalCircles / limitNum);
  
      res.status(200).json({
        circles,
        currentPage: pageNum,
        totalPages,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  export const getCircleWithMembersAndOwner = async (req, res) => {
    try {
      const { circleId } = req.params;
  
      // Step 1: Get the circle with owner
      const circle = await Circle.findById(circleId).populate("owner");
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }
  
      // Step 2: Get all members of the circle with user info
      const memberships = await CircleMembership.find({ circle: circleId }).populate("user");
      const members = memberships.map((membership) => membership.user);
  
      // Step 3: Construct response with both circle and member details
      const response = {
        ...circle.toObject(),  // Convert the circle document to a plain object
        members,  // Add the populated members to the response
      };
  
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };