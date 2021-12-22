const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const isAuthenticated = require("../middleware/isAuthenticated");

const cloudinary = require("cloudinary").v2;

router.get("/find/all", isAuthenticated, async (req, res) => {
  try {
    const users = await User.find().select(["-token", "-hash", "-salt", "-_id", "-updatedAt", "-__v"]);
    if (users) {
      res.status(200).json({ message: "Users list", result: users });
    } else {
      res.status(404).json({ message: "There are no users in the list yet", result: [] });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.get("/find/:email", isAuthenticated, async (req, res) => {
  try {
    const regex = new RegExp(req.params.email, "i");
    const user = await User.findOne({ email: regex }).select(["-token", "-hash", "-salt", "-_id", "-updatedAt", "-__v"]);

    if (user) {
      res.status(200).json({ message: "The user has been found", result: user });
    } else {
      res.status(404).json({ message: `This user has not been found, please verify the email adress ${req.params.email} `, result: [] });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/find/:name", isAuthenticated, async (req, res) => {
  try {
    const newStr = req.params.name.split(" ").reverse().join(" ");
    const regex1 = new RegExp(req.params.name, "gi");
    const regex2 = new RegExp(newStr, "gi");
    let user = await User.findOne({ fullName: regex1 }).select(["-token", "-hash", "-salt", "-_id", "-updatedAt", "-__v"]);
    if (!user) {
      user = await User.findOne({ fullName: regex2 }).select(["-token", "-hash", "-salt", "-_id", "-updatedAt", "-__v"]);
    }

    if (user) {
      res.status(200).json({ message: "The user has been found", result: user });
    } else {
      res.status(404).json({ message: `This user has not been found, please verify the name ${req.params.name}`, result: [] });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/update", isAuthenticated, async (req, res) => {
  try {
    const userToUpdate = await User.findById(req.user._id);
    const { lastName, firstName, email, gender, bio, phone, adress, cp, city, birthday, newPassword } = req.body;

    if (userToUpdate) {
      if (lastName) {
        userToUpdate.lastName = lastName;
      }
      if (firstName) {
        userToUpdate.firstName = firstName;
      }
      if (firstName || lastName) {
        userToUpdate.fullName = `${userToUpdate.lastName} ${userToUpdate.firstName}`;
      }
      if (email) {
        userToUpdate.email = email;
      }
      if (gender) {
        userToUpdate.gender = gender;
      }
      if (birthday) {
        userToUpdate.birthday = birthday;
      }
      if (bio) {
        userToUpdate.bio = bio;
      }
      if (phone) {
        userToUpdate.informations.phone = phone;
      }
      if (adress) {
        userToUpdate.informations.adress = adress;
      }
      if (cp) {
        userToUpdate.informations.cp = cp;
      }
      if (city) {
        userToUpdate.informations.city = city;
      }
      if (req.body.avatar) {
        userToUpdate.avatar = req.body.avatar;
      }

      if (req.files.avatar) {
        if (req.files.avatar.mimetype !== "image/jpg" && req.files.avatar.mimetype !== "image/png" && req.files.avatar.mimetype !== "image/jpeg")
          throw Error("invalid file");
        await cloudinary.api.delete_all_resources(`/family-network/${userToUpdate._id}`);
        const response = await cloudinary.uploader.upload(req.files.avatar.tempFilePath, {
          folder: `/family-network/${req.user._id}`,
        });
        userToUpdate.avatar = response.secure_url;
      }

      if (newPassword) {
        const newSalt = uid2(16);
        const newHash = SHA256(req.fields.newPassword + newSalt).toString(encBase64);
        const newToken = uid2(64);

        userToUpdate.hash = newHash;
        userToUpdate.salt = newSalt;
        userToUpdate.token = newToken;
      }

      await userToUpdate.save();
      res.status(200).json({
        message: "Your profile has been well updated",
        result: userToUpdate,
      });
    } else {
      res.status(404).json({ message: `This user has not been found, please verify the id : ${req.body.id}` });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/delete", isAuthenticated, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.user._id);
    const postToDeleteFromUser = await Post.find({ posterId: req.user._id });
    if (userToDelete) {
      await userToDelete.remove();
      await postToDeleteFromUser.remove();
      await cloudinary.api.delete_all_resources(`/family-network/${req.user._id}`);
      await cloudinary.api.delete_folder(`/family-network/${req.user._id}`);

      res.status(200).json({ message: "This user has been well deleted" });
    } else {
      res.status(404).json({ message: `This user has not been found, please verify the id : ${req.user._id}` });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
