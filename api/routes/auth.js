const express = require("express");
const User = require("../models/User");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.post("/login", async (req, res) => {
  try {
    const regex = new RegExp(req.body.email, "i");
    const findMail = await User.findOne({ email: regex });

    if (findMail) {
      const newHash = SHA256(req.body.password + findMail.salt).toString(encBase64);
      if (newHash === findMail.hash) {
        res.status(200).json({
          data: {
            token: findMail.token,
            fullName: findMail.fullName,
          },
        });
      } else {
        res.status(401).json({ message: "Unauthorized. Please verify your email or password." });
      }
    } else {
      res.status(404).json({ message: `This user has not been found in our database. Please verify your password or email : ${req.body.email}` });
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const checkMail = await RegExp(email, "i");
    const findMail = await User.findOne({ email: checkMail });

    if (findMail) {
      res.status(400).json({
        message: "This user already exist. Please verify your email.",
        result: {},
      });
    } else {
      //Methode d'encryptage
      const salt = uid2(16);
      const hash = SHA256(password + salt).toString(encBase64);
      const token = uid2(64);

      //Création d'un nouvel utilisateur
      const user = new User({
        firstName: firstName,
        lastName: lastName,
        fullName: `${lastName} ${firstName}`,
        email: email,
        token: token,
        salt: salt,
        hash: hash,
      });

      await user.save();

      res.status(200).json({
        message: "The new user has been saved !",
        result: {
          user: user.fullName,
          email: user.email,
          token: user.token,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/new-password", async (req, res) => {
  try {
    const checkMail = RegExp(req.body.email, "i");
    const userToUpdate = await User.findOne({ email: checkMail });
    if (userToUpdate) {
      const newSalt = uid2(16);
      const newHash = SHA256(req.body.newPassword + newSalt).toString(encBase64);
      const newToken = uid2(64);

      userToUpdate.hash = newHash;
      userToUpdate.salt = newSalt;
      userToUpdate.token = newToken;

      await userToUpdate.save();

      res.status(200).json({
        message: "Your profile has been well updated",
        result: userToUpdate,
      });
    } else {
      res.status(404).json({ message: `This user has not been found, please verify the email : ${req.body.email}` });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
