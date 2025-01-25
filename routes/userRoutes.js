const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  loginUser,
} = require("../controllers/userController");

// GET all users
router.get("/", getUsers);

// POST create a new user
router.post("/", createUser);

router.post("/login", loginUser);

module.exports = router;
