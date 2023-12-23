const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fis',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Hash password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
  db.query(query, [firstName, lastName, email, hashedPassword], (err, results) => {
    if (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(201).json({ message: 'User registered successfully' });
    }
  });
});

// Login user
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (results.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
    } else {
      const user = results[0];

      // Compare hashed password
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Generate token
        const token = jwt.sign({ userId: user.id }, 'pea458', { expiresIn: '1h' });

        res.status(200).json({ token });
      } else {
        res.status(401).json({ error: 'Invalid email or password' });
      }
    }
  });
});
app.get('/api/all-users', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching all users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json(results);
      }
    });
  });
app.get('/api/user-details', authenticateToken, (req, res) => {
    // req.user contains the decoded user ID from the token
    const userId = req.user.userId;
  
    const query = 'SELECT first_name, last_name FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (results.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        const userDetails = results[0];
        res.status(200).json(userDetails);
      }
    });
  });
  
  // Middleware to authenticate the token
  // Middleware to authenticate the token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    console.log("ssss11s");
  
    if (!token) {
      console.log("ssss11s");
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    jwt.verify(token, 'pea458', (err, user) => {
        if (err) {
          console.error('Error verifying token:', err);
          return res.status(403).json({ error: 'Forbidden' });
        }
      
        console.log("sssss222");
        req.user = user;
        console.log(req.user);
        next();
      });
  }
  app.put('/api/update-user/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;
    const updatedUserData = req.body;
  
    const updateQuery = 'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?';
  
    db.query(
      updateQuery,
      [updatedUserData.first_name, updatedUserData.last_name, updatedUserData.email, userId],
      (err, results) => {
        if (err) {
          console.error('Error updating user:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json({ message: 'User updated successfully' });
        }
      }
    );
  });
  app.delete('/api/delete-user/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;
    console.log(userId);
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
  
    db.query(deleteQuery, [userId], (err, results) => {
      if (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json({ message: 'User deleted successfully' });
      }
    });
  });
    

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
