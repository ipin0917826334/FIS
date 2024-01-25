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
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
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
    const userId = req.user.userId;
    const { product_name, description, price, product_stock, supplier_id } = req.body; // change supplier to supplier_id
    const product_image = req.file.filename;

    // Update your SQL query to use the supplier_id
    const query =
      'INSERT INTO products (product_name, product_stock, description, price, product_image, supplier_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [product_name, product_stock, description, price, product_image, supplier_id, userId], (err, results) => {
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

app.post('/api/add-supplier', authenticateToken ,async (req, res) => {
  console.log(req.body)
  const userId = req.user.userId;
  const { supplier_name, location, email } = req.body;
  console.log(supplier_name,location,email);
  const query = 'INSERT INTO suppliers (supplier_name, location, email, user_id) VALUES (?, ?, ?, ?)';
  db.query(query, [supplier_name, location, email, userId], (err, results) => {
    if (err) {
      console.error('Error add supplier:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.status(201).json({ message: 'Add supplier successfully' });
    }
  });
});
app.get('/api/all-suppliers', authenticateToken, (req, res) => {
  const query = `
  SELECT suppliers.*, CONCAT(users.first_name, ' ', users.last_name) AS created_by
  FROM suppliers 
  JOIN users ON suppliers.user_id = users.id`;
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
        const token = jwt.sign({ userId: user.id }, 'pea458', { expiresIn: '8h' });

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
    const query = `
    SELECT products.*, CONCAT(users.first_name, ' ', users.last_name) AS created_by, suppliers.supplier_name AS supplier
    FROM products 
    JOIN users ON products.user_id = users.id
    JOIN suppliers ON products.supplier_id = suppliers.id`;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json(results);
      }
    });
  });
app.get('/api/user-details', authenticateToken, (req, res) => {
    const userId = req.user.userId;
  
    const query = 'SELECT id, first_name, last_name FROM users WHERE id = ?';
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
  
  app.get('/api/products-by-supplier/:id', authenticateToken, (req, res) => {
    const supplierId = req.params.id;
    
    // Assuming that each product has a 'supplier_id' that references 'id' in the 'suppliers' table
    const query = `
      SELECT product_name
      FROM products
      WHERE supplier_id = ?
    `;
    
    db.query(query, [supplierId], (err, results) => {
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
  
    const updateQuery = 'UPDATE products SET product_name = ?, product_stock = ?, description = ?, price = ? WHERE id = ?';
  
    db.query(
      updateQuery,
      [updatedProductData.product_name, updatedProductData.product_stock, updatedProductData.description, updatedProductData.price, productId],
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
  app.post('/api/checkout', authenticateToken, async (req, res) => {
    const cart = req.body;
  
    try {
      for (const item of cart) {
        const productId = item.id;
        const productQuantity = item.quantity;

        const product = await getProductById(productId);
  
        if (!product) {
          return res.status(404).json({ error: `Product with ID ${productId} not found` });
        }
  
        if (product.product_stock < productQuantity) {
          return res.status(400).json({ error: `Insufficient stock for product ${product.product_name}` });
        }
        const newStock = product.product_stock - productQuantity;

        await updateProductStockInDatabase(productId, newStock);
      }
  

  
      res.status(200).json({ message: 'Checkout successful' });
    } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  async function getProductById(productId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM products WHERE id = ?';
      db.query(query, [productId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
  }
  
  async function updateProductStockInDatabase(productId, newStock) {
    return new Promise((resolve, reject) => {
      const updateQuery = 'UPDATE products SET product_stock = ? WHERE id = ?';
      db.query(updateQuery, [newStock, productId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
