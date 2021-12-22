const express = require("express");
const router = express.Router();
const User = require("../models/User");
const isAuthenticated = require("../middleware/isAuthenticated");

// Follow routes

router.patch("/follow/:id", isAuthenticated, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const user = await User.findById(req.user._id);
    if (userToFollow) {
      if (userToFollow.followers.indexOf(req.user._id) === -1 && user.following.indexOf(req.params.id) === -1) {
        userToFollow.followers.push(req.user._id);
        user.following.push(req.params.id);

        await user.save();
        await userToFollow.save();

        res.status(200).json({ message: "This user has been well added to your following" });
      } else {
        res.status(400).json({ message: `This user is already in your following list` });
      }
    } else {
      res.status(400).json({ message: "This user has not been well added to your following" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.patch("/unfollow/:id", isAuthenticated, async (req, res) => {
  try {
    const userToUnFollow = await User.findById(req.params.id);
    const user = await User.findById(req.user._id);
    if (userToUnFollow) {
      if (userToUnFollow.followers.indexOf(req.user._id) !== -1 && user.following.indexOf(req.params.id) !== -1) {
        const indexFollower = userToUnFollow.followers.indexOf(req.user._id);
        const indexFollowing = user.following.indexOf(req.params.id);

        userToUnFollow.followers.splice(indexFollower, 1);
        user.following.splice(indexFollowing, 1);
        await user.save();
        await userToUnFollow.save();

        res.status(200).json({ message: "This user has been well deleted to your following" });
      } else {
        res.status(400).json({ message: `This user is not part of your following list ${req.params.id}` });
      }
    } else {
      res.status(400).json({ message: "This user has not been well deleted to your following" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Friends routes
router.get("/myfriends", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const friends = [];
      for (let i = 0; i < user.friends.length; i++) {
        // .select allow to hide the data from informations we are looking for.
        const friend = await User.findById(user.friends[i]).select(["-token", "-hash", "-salt", "-pending", "-likes", "-_id", "-updatedAt", "-__v"]);
        friends.push(friend);
      }
      res.status(200).json({
        result: friends,
      });
    } else {
      res.status(400).json({
        message: "Sorry, but you are alone in this zone",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/add/:id", isAuthenticated, async (req, res) => {
  try {
    const userToAdd = await User.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (userToAdd) {
      if (
        userToAdd.friends.indexOf(req.body.idToFollow) === -1 &&
        userToAdd.pending.indexOf(req.body.idToFollow) === -1 &&
        user.friends.indexOf(req.params.id) === -1
      ) {
        userToAdd.pending.push(req.user._id);
        user.pending.push(req.params.id);

        await user.save();
        await userToAdd.save();

        res.status(200).json({ message: "Your request has been sent" });
      } else {
        res.status(400).json({ message: `This user is already in your pending or friend list` });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/accept/:id", isAuthenticated, async (req, res) => {
  try {
    const userToAccept = await User.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (userToAccept) {
      if (
        userToAccept.pending.indexOf(req.user._id) !== -1 &&
        userToAccept.friends.indexOf(req.user._id) === -1 &&
        user.pending.indexOf(req.params.id) !== -1 &&
        user.friends.indexOf(req.params.id) === -1
      ) {
        const indexFollower = userToAccept.pending.indexOf(req.user._id);
        const indexFollowing = user.pending.indexOf(req.params.id);

        userToAccept.friends.push(req.user._id);
        userToAccept.pending.splice(indexFollower, 1);

        user.friends.push(req.params.id);
        user.pending.splice(indexFollowing, 1);

        await user.save();
        await userToAccept.save();

        res.status(200).json({ message: "This user has been well added to your friend" });
      } else {
        res.status(400).json({ message: `This user ${req.params.id} is not part of your pending list or is already in your friend list ` });
      }
    } else {
      res.status(400).json({ message: "This user has not been well added to your friends" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/deny/:id", isAuthenticated, async (req, res) => {
  try {
    const userToDeny = await User.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (userToDeny) {
      if (userToDeny.pending.indexOf(req.user._id) !== -1 && user.pending.indexOf(req.params.id) !== -1) {
        const indexFollower = userToDeny.pending.indexOf(req.user._id);
        const indexFollowing = user.pending.indexOf(req.params.id);

        userToDeny.pending.splice(indexFollower, 1);
        user.pending.splice(indexFollowing, 1);

        await user.save();
        await userToDeny.save();

        res.status(200).json({ message: "This user has been well deny from your pending list" });
      } else {
        res.status(400).json({ message: `This user ${req.params.id} is not part of your pending list` });
      }
    } else {
      res.status(400).json({ message: "This user has not been well deny to your pending list" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (userToDelete) {
      if (userToDelete.friends.indexOf(req.user._id) !== -1 && user.friends.indexOf(req.params.id) !== -1) {
        const indexFollower = userToDelete.friends.indexOf(req.user._id);
        const indexFollowing = user.friends.indexOf(req.params.id);

        userToDelete.friends.splice(indexFollower, 1);
        user.friends.splice(indexFollowing, 1);

        await user.save();
        await userToDelete.save();

        res.status(200).json({ message: "This user has been well deny from your friends list" });
      } else {
        res.status(400).json({ message: `This user ${req.params.id} is not part of your friends list` });
      }
    } else {
      res.status(400).json({ message: "This user has not been well deny to your friends list" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
