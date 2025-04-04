const bcrypt = require('bcryptjs');
const sql = require('mssql');
const dbConfig = require('../config/db.config');
const { validationResult } = require('express-validator');

const signup = async (req, res) => {
  // Validate request data if needed
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  
  try {
    const pool = await sql.connect(dbConfig);
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .query('INSERT INTO Users (email, password) VALUES (@email, @password)');
      
    res.status(201).send('User created');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
};

const login = async (req, res) => {
  // Validate request data if needed
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  
  try {
    const pool = await sql.connect(dbConfig);
    // Retrieve the user with the provided email
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');
    
    // If no user found, send error response
    if (result.recordset.length === 0) {
      return res.status(401).send('Invalid email or password');
    }
    
    const user = result.recordset[0];
    
    // Compare provided password with the hashed password stored in the database
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send('Invalid email or password');
    }
    
    // If desired, implement session creation or JWT token generation here.
    // For simplicity, we just return a success message.
    res.status(200).send('Login successful');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
};

module.exports = { signup, login };
