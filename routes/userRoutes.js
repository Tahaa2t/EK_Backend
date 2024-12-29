const express = require('express');
const router = express.Router();
const { getUsers, createUser } = require('../controllers/userController');

// GET all users
router.get('/', getUsers);

// POST create a new user
router.post('/', createUser);

module.exports = router;
