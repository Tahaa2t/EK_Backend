const express = require("express");
const router = express.Router();
const {
  loginUser,
  signupUser,
} = require("../controllers/userController");

// GET all users
// router.get("/", getUsers);

// POST create a new user
router.post("/signup", signupUser);

router.post("/login", loginUser);

module.exports = router;
