const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const Post = require("../models/Post");
const User = require("../models/User");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

// Read one post
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const readPost = await Post.findById(req.params.id).select(["-__v"]);

    if (readPost) {
      res.status(200).json({ message: "Post found", result: readPost });
    } else {
      res.status(400).json({ message: `This post ${req.params.id} doesn't exists`, result: null });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// read all post
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const readPost = await Post.find();

    if (readPost) {
      res.status(200).json({ message: "Posts found", result: readPost });
    } else {
      res.status(400).json({ message: `An error occured, please try again`, result: [] });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read all posts from one user
router.get("/user/:userId", isAuthenticated, async (req, res) => {
  try {
    const postByUser = await Post.find({ posterId: req.params.userId });
    if (postByUser) {
      res.status(200).json({ message: "Posts found", result: postByUser });
    } else {
      res.status(400).json({ message: `This user ${req.params.userId} doesn't exist` });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create post
router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const newPost = new Post({
      posterId: req.user._id,
      message: req.body.message,
      picture: "",
      video: req.body.video,
      likers: [],
      comments: [],
    });

    if (req.files) {
      if (req.files.size > 500000) throw Error("max size");

      const response = await cloudinary.uploader.upload(req.files.picture.tempFilePath, {
        folder: `/family-network/${req.user._id}/${newPost._id}`,
      });
      newPost.picture = response.secure_url;
    }

    await newPost.save();
    return res.status(201).json({ message: "Your post has been well create", result: newPost });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// update post

router.put("/update/:id", isAuthenticated, async (req, res) => {
  try {
    const postToUpdate = await Post.findById(req.params.id);
    if (postToUpdate) {
      if (req.body.message) {
        postToUpdate.message = req.body.message;
      }
      if (req.body.video) {
        postToUpdate.video = req.body.video;
      }

      if (req.files) {
        if (req.files.picture.mimetype !== "image/jpg" && req.files.picture.mimetype !== "image/png" && req.files.picture.mimetype !== "image/jpeg")
          throw Error("invalid file");

        await cloudinary.api.delete_all_resources(`/family-network/${req.user._id}/${req.params.id}`);
        const response = await cloudinary.uploader.upload(req.files.picture.tempFilePath, {
          folder: `/family-network/${req.user._id}/${req.params.id}`,
        });
        postToUpdate.picture = response.secure_url;
      }

      await postToUpdate.save();
      res.status(200).json({ message: "Your post has been well edited", result: postToUpdate });
    } else {
      res.status(400).json({ message: `This post ${req.params.id} doesn't exist` });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// delete post
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const deletePost = await Post.findById(req.params.id);
    if (deletePost) {
      await deletePost.remove();
      await cloudinary.api.delete_all_resources(`/family-network/${req.user._id}/${req.params.id}`);
      await cloudinary.api.delete_folder(`/family-network/${req.user._id}/${req.params.id}`);

      res.status(200).json({ message: "This post has been well deleted" });
    } else {
      res.status(400).json({ message: `This post ${req.params.id} doesn't exist` });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// like post
router.patch("/like/:id", isAuthenticated, async (req, res) => {
  try {
    const postToLike = await Post.findById(req.params.id);

    if (postToLike) {
      if (postToLike.likers.indexOf(req.user._id) === -1) {
        postToLike.likers.push(req.user._id);
        await postToLike.save();

        const user = await User.findById(postToLike.posterId);
        user.likes.push(req.params.id);

        await user.save();

        res.status(200).json({ message: "You like this post" });
      } else {
        res.status(400).json({ message: `You already liked this post` });
      }
    } else {
      res.status(400).json({ message: "This post has not been well added to your likes" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// dislike post

router.patch("/dislike/:id", isAuthenticated, async (req, res) => {
  try {
    const postToDislike = await Post.findById(req.params.id);

    if (postToDislike) {
      if (postToDislike.likers.indexOf(req.user._id) !== -1) {
        const index = postToDislike.likers.indexOf(req.user._id);
        postToDislike.likers.splice(index, 1);
        await postToDislike.save();

        const user = await User.findById(postToDislike.posterId);
        const userIndex = user.likes.indexOf(req.params.id);
        user.likes.splice(userIndex, 1);

        await user.save();

        res.status(200).json({ message: "You disliked this post" });
      } else {
        res.status(400).json({ message: `You already don't like this post` });
      }
    } else {
      res.status(400).json({ message: "This post has not been well deleted to your likes" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// comment post

router.post("/comment/:id", isAuthenticated, async (req, res) => {
  try {
    const postToComment = await Post.findById(req.params.id);
    if (postToComment) {
      postToComment.comments.push({
        posterId: req.user._id,
        commenterPseudo: req.user.fullName,
        text: req.body.text,
        timestamp: new Date().getTime(),
      });

      await postToComment.save();
      res.status(200).json({ message: "Your comment has been well added", result: postToComment });
    } else {
      res.status(400).json({ message: `This post ${req.params.id} has not been found`, result: "" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// edit comment post
router.post("/comment/:id/edit/:commentId", isAuthenticated, async (req, res) => {
  try {
    const postToComment = await Post.findById(req.params.id);
    if (postToComment) {
      const indexOfComment = postToComment.comments.findIndex((comment) => {
        return comment._id.equals(req.params.commentId);
      });
      postToComment.comments[indexOfComment].text = req.body.text;

      await postToComment.save();
      res.status(200).json({ message: "Your comment has been well added", result: postToComment });
    } else {
      res.status(400).json({ message: `This post ${req.params.id} has not been found`, result: "" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// delete comment post
router.delete("/comment/:id/delete/:commentId", isAuthenticated, async (req, res) => {
  try {
    const postToComment = await Post.findById(req.params.id);
    if (postToComment) {
      const indexOfComment = postToComment.comments.findIndex((comment) => {
        return comment._id.equals(req.params.commentId);
      });

      await postToComment.comments[indexOfComment].remove();
      await postToComment.save();
      res.status(200).json({ message: "Your comment has been well deleted", result: postToComment });
    } else {
      res.status(400).json({ message: `This post ${req.params.id} has not been found`, result: "" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
