const pool = require("../config/db");
const bcrypt = require("bcrypt");

// Get all users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM event_karlo_backend.users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const {
    user_type,
    email,
    first_name,
    last_name,
    date_of_birth,
    phone,
    password,
  } = req.body;

  // const user_type = type;
  const now = new Date();
  const created_at = now.toISOString();
  const updated_at = now.toISOString();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a transaction
    await pool.query("BEGIN");

    // add user in users table
    const result = await pool.query(
      `INSERT INTO event_karlo_backend.users 
      (email, first_name, last_name, date_of_birth, phone, user_type, created_at, updated_at) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        email,
        first_name,
        last_name,
        date_of_birth,
        phone,
        user_type,
        created_at,
        updated_at,
      ]
    );

    userId = result.rows[0].user_id;

    // Insert into auth table
    await pool.query(
      `INSERT INTO event_karlo_backend.auth 
      (user_id, password_hash, created_at, updated_at) 
      VALUES 
      ($1, $2, $3, $4)`,
      [userId, hashedPassword, created_at, updated_at]
    );

    // Commit the transaction
    await pool.query("COMMIT");

    res.status(201).json(result.rows[0]);
  } catch (error) {
    // Rollback the transaction in case of any error
    await pool.query("ROLLBACK");
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email) {
      throw Error("Email field is required");
    }

    const result = await pool.query(
      `CALL event_karlo_backend.get_password_hash_by_email($1, $2)`,
      [email, null]
    );

    if (!result) {
      throw Error("No results found");
    }

    passwordHash = result.rows[0].password_hash;

    if (await bcrypt.compare(password, passwordHash)) {
      res.status(200).json({
        status: "Success",
        message: `user ${email} is logged in`,
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Authentication Error" });
  }
};

module.exports = { getUsers, createUser, loginUser };
