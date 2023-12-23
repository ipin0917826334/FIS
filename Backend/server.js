const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fis',
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Use a unique filename for each uploaded file
  },
});

const upload = multer({ storage });
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});
app.post('/api/add-product', authenticateToken, upload.single('product_image'), async (req, res) => {
  try {
    const { product_name, description, product_stock,supplier, createdBy } = req.body;
    const product_image = req.file.filename; // Get the filename of the uploaded image

    // Save form data and image filename to the database
    const query =
      'INSERT INTO products (product_name, product_stock, description,  product_image , supplier, created_by) VALUES (?, ? , ?, ?, ?, ?)';
    db.query(query, [product_name,product_stock, description, product_image, supplier, createdBy], (err, results) => {
      if (err) {
        console.error('Error add product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(201).json({ message: 'Add product successfully' });
      }
    });
  } catch (error) {
    console.error('Error during add product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Register user
app.post('/api/add-supplier', authenticateToken ,async (req, res) => {
  console.log(req.body)
  const { supplier_name, location, email, createdBy } = req.body;
  console.log(supplier_name,location,email);
  const query = 'INSERT INTO suppliers (supplier_name, location, email, created_by) VALUES (?, ?, ?, ?)';
  db.query(query, [supplier_name, location, email, createdBy], (err, results) => {
    if (err) {
      console.error('Error add supplier:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(201).json({ message: 'Add supplier successfully' });
    }
  });
});
app.get('/api/all-suppliers', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM suppliers';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all suppliers:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(200).json(results);
    }
  });
});

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
  app.get('/api/all-products', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json(results);
      }
    });
  });
  app.get('/api/all-suppliers', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM suppliers';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching all suppliers:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json(results);
        console.log(results)
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
  
// Add this route after your existing routes
app.get('/api/products-by-supplier/:supplierName', authenticateToken, (req, res) => {
  const supplierName = req.params.supplierName;
  console.log(supplierName)
  // Query to fetch product names based on the supplier's name
  const query = `
    SELECT product_name
    FROM products
    WHERE supplier = (
      SELECT supplier_name FROM suppliers WHERE supplier_name = ?
    )
  `;

  db.query(query, [supplierName], (err, results) => {
    if (err) {
      console.error('Error fetching products by supplier:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const productNames = results.map((result) => result.product_name);
      res.status(200).json(productNames);
    }
  });
});

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
  app.put('/api/update-product/:id', authenticateToken, (req, res) => {
    const productId = req.params.id;
    const updatedProductData = req.body;
  
    const updateQuery = 'UPDATE products SET product_name = ?, product_stock = ?, description = ? WHERE id = ?';
  
    db.query(
      updateQuery,
      [updatedProductData.product_name, updatedProductData.product_stock, updatedProductData.description, productId],
      (err, results) => {
        if (err) {
          console.error('Error updating products:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json({ message: 'Product updated successfully' });
        }
      }
    );
  });
  app.put('/api/update-supplier/:id', authenticateToken, (req, res) => {
    const supplierId = req.params.id;
    const updatedSupplierData = req.body;
  
    const updateQuery = 'UPDATE suppliers SET supplier_name = ?, location = ?, email = ? WHERE id = ?';
  
    db.query(
      updateQuery,
      [updatedSupplierData.supplier_name, updatedSupplierData.location, updatedSupplierData.email, supplierId],
      (err, results) => {
        if (err) {
          console.error('Error updating supplier:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.status(200).json({ message: 'Supplier updated successfully' });
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
  app.delete('/api/delete-product/:id', authenticateToken, (req, res) => {
    const productId = req.params.id;
    console.log(productId);
    const deleteQuery = 'DELETE FROM products WHERE id = ?';
  
    db.query(deleteQuery, [productId], (err, results) => {
      if (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json({ message: 'Product deleted successfully' });
      }
    });
  });
  app.delete('/api/delete-supplier/:id', authenticateToken, (req, res) => {
    const supplierId = req.params.id;
  
    const deleteQuery = 'DELETE FROM suppliers WHERE id = ?';
  
    db.query(deleteQuery, [supplierId], (err, results) => {
      if (err) {
        console.error('Error deleting supplier:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json({ message: 'Supplier deleted successfully' });
      }
    });
  });
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
