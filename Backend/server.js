const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5002;

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
    const { product_name, description, price, product_stock, supplier_id } = req.body;
    const product_image = req.file.filename;

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

app.post('/api/add-supplier', authenticateToken, async (req, res) => {
  console.log(req.body)
  const userId = req.user.userId;
  const { supplier_name, location, email } = req.body;
  console.log(supplier_name, location, email);
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

app.delete('/api/delete-batch/:batchNumber', authenticateToken, async (req, res) => {
  const { batchNumber } = req.params;

  db.beginTransaction(async (err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      const findBatchIdQuery = 'SELECT id FROM batches WHERE batch_number = ?';
      const batchId = await new Promise((resolve, reject) => {
        db.query(findBatchIdQuery, [batchNumber], (err, results) => {
          if (err) return reject(err);
          if (results.length > 0) {
            resolve(results[0].id);
          } else {
            reject(new Error('Batch not found'));
          }
        });
      });

      await new Promise((resolve, reject) => {
        const historyDeleteQuery = `
                  DELETE order_items_history
                  FROM order_items_history
                  JOIN order_items ON order_items_history.order_item_id = order_items.id
                  JOIN orders ON order_items.order_id = orders.id
                  WHERE orders.batch_id = ?`;
        db.query(historyDeleteQuery, [batchId], (err, results) => {
          if (err) return reject(err);
          console.log('Deleted order_items_history:', results.affectedRows);
          resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        const itemsDeleteQuery = `
                  DELETE order_items
                  FROM order_items
                  JOIN orders ON order_items.order_id = orders.id
                  WHERE orders.batch_id = ?`;
        db.query(itemsDeleteQuery, [batchId], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        const ordersDeleteQuery = 'DELETE FROM orders WHERE batch_id = ?';
        db.query(ordersDeleteQuery, [batchId], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      await new Promise((resolve, reject) => {
        const batchDeleteQuery = 'DELETE FROM batches WHERE id = ?';
        db.query(batchDeleteQuery, [batchId], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      db.commit((err) => {
        if (err) {
          console.error('Error committing transaction:', err);
          db.rollback(() => res.status(500).json({ error: 'Internal Server Error' }));
          return;
        }
        res.json({ message: 'Batch and all associated records deleted successfully' });
      });
    } catch (error) {
      console.error('Error during batch deletion:', error);
      db.rollback(() => res.status(500).json({ error: 'Internal Server Error' }));
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
app.get('/api/products-count-by-supplier', authenticateToken, (req, res) => {
  const query = `
    SELECT s.supplier_name, COUNT(p.id) as product_count
    FROM suppliers s
    LEFT JOIN products p ON s.id = p.supplier_id
    GROUP BY s.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products count by supplier:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const dataForChart = results.map(row => ({
        supplier_name: row.supplier_name,
        product_count: row.product_count
      }));

      res.status(200).json(dataForChart);
    }
  });
});

app.get('/api/products-notification', authenticateToken, async (req, res) => {
  try {
    const query = `
    SELECT 
        p.product_name, 
        p.product_stock AS product_stock, 
        MAX(oi.eoq) AS eoq
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.product_name
    HAVING p.product_stock = 0 OR (p.product_stock < MAX(oi.eoq) AND p.product_stock > 0);
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching product notifications:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const notifications = results.map((row) => ({
          ...row,
          notification: row.product_stock === 0 ? 'Out of Stock' : 'Low stock',
        }));
        res.json(notifications);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});






app.get('/api/order-quantities-by-date', authenticateToken, (req, res) => {
  const query = `
    SELECT DATE(orders.created_at) AS date, SUM(order_items.quantity) AS quantity
    FROM orders
    JOIN order_items ON orders.id = order_items.order_id
    GROUP BY DATE(orders.created_at)
    ORDER BY DATE(orders.created_at);
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching order quantities by date:', err);
      res.status(500).json({ error: 'Internal Server Error', details: err });
    } else {
      const formattedResults = results.map(row => ({
        date: row.date,
        quantity: row.quantity
      }));
      res.json(formattedResults);
    }
  });
});
app.post('/api/add-delivery/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const { deliveryQuantity } = req.body;

  db.beginTransaction(async err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      const orderItemQuery = 'SELECT quantity, quantity_received, lead_time, product_id FROM order_items WHERE id = ?';
      const orderItemResults = await new Promise((resolve, reject) => {
        db.query(orderItemQuery, [id], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      const productId = orderItemResults.product_id;
      const previousQuantityReceived = orderItemResults.quantity_received;
      const quantityOrdered = orderItemResults.quantity;
      const quantityDelivered = parseInt(deliveryQuantity);

      const newQuantityReceived = previousQuantityReceived + quantityDelivered;

      const historyQuery = 'INSERT INTO order_items_history (order_item_id, previous_quantity_received, new_quantity_received, quantity_delivered, received_date) VALUES (?, ?, ?, ?, NOW())';
      await new Promise((resolve, reject) => {
        db.query(historyQuery, [id, previousQuantityReceived, newQuantityReceived, quantityDelivered], (err, results) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const updateStockQuery = 'UPDATE products SET product_stock = product_stock + ? WHERE id = ?';
      await new Promise((resolve, reject) => {
        db.query(updateStockQuery, [quantityDelivered, productId], (err, results) => {
          if (err) reject(err);
          else resolve();
        });
      });

      let status;
      if (newQuantityReceived >= quantityOrdered) {
        status = 'complete';
      } else if (newQuantityReceived > 0) {
        status = 'incomplete';
      } else {
        status = 'pending';
      }

      // const updateOrderItemQuery = 'UPDATE order_items SET quantity_received = ?, status = ? WHERE id = ?';
      // await new Promise((resolve, reject) => {
      //   db.query(updateOrderItemQuery, [newQuantityReceived, status, id], (err, results) => {
      //     if (err) reject(err);
      //     else resolve();
      //   });
      // });
      const qtyLeadtime = orderItemResults.lead_time;
      const stdDevDemand = Math.sqrt(orderItemResults.quantity * qtyLeadtime);
      const safetyFactor = 0.67 * stdDevDemand;
      const qtySafetyStock = isNaN(safetyFactor) ? 0 : safetyFactor;
      const avgDemand = orderItemResults.quantity / 365;
      const leadTimeDemand = avgDemand * qtyLeadtime;
      const safetyStockDemand = avgDemand * qtySafetyStock;
      const qtyReorderPoint = leadTimeDemand + safetyStockDemand;
      const qtyEOQ = Math.sqrt((2 * parseInt(deliveryQuantity) * 31.42) / 8.22);

      const updateOrderItemsQuery = `
      UPDATE order_items 
      SET quantity_received = ?, 
          status = ?, 
          safety_stock = ?, 
          reorder_point = ?, 
          eoq = ?
      WHERE id = ?
  `;

      await new Promise((resolve, reject) => {
        db.query(updateOrderItemsQuery, [newQuantityReceived, status, qtySafetyStock, qtyReorderPoint, qtyEOQ, id], (err, results) => {
          if (err) reject(err);
          else resolve();
        });
      });

      db.commit(err => {
        if (err) {
          console.error('Error committing transaction:', err);
          db.rollback(() => {
            res.status(500).json({ error: 'Internal Server Error' });
          });
          return;
        }
        res.json({ message: 'Order item updated successfully', status: status });
      });
    } catch (error) {
      console.error('Error during update:', error);
      db.rollback(() => {
        res.status(500).json({ error: 'Internal Server Error' });
      });
    }
  });
});

app.get('/api/order-items-history/:itemId', authenticateToken, async (req, res) => {
  const itemId = req.params.itemId;
  const query = `
    SELECT * FROM order_items_history
    WHERE order_item_id = ?
    ORDER BY received_date DESC
  `;
  db.query(query, [itemId], (err, results) => {
    if (err) {
      console.error('Error fetching order items history:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(results);
  });
});

app.get('/api/order-status-counts', authenticateToken, async (req, res) => {
  const query = `
    SELECT 
      status, 
      suppliers.supplier_name, 
      COUNT(order_items.id) AS count
    FROM 
      order_items
    JOIN 
      products ON order_items.product_id = products.id
    JOIN 
      suppliers ON products.supplier_id = suppliers.id
    GROUP BY 
      status, suppliers.supplier_name;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching order status counts:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err });
    }

    const statusCounts = results.reduce((acc, row) => {
      if (!acc[row.status]) {
        acc[row.status] = {};
      }
      acc[row.status][row.supplier_name] = parseInt(row.count, 10);
      return acc;
    }, { incomplete: {}, pending: {}, complete: {} });

    res.json(statusCounts);
  });
});

function generateBatchNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BATCH-${year}${month}${day}-${randomString}`;
}

app.post('/api/submit-order', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { orderItems } = req.body;

  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const batchNumber = generateBatchNumber();
    db.query('INSERT INTO batches (batch_number) VALUES (?)', [batchNumber], (err, batchResult) => {
      if (err) {
        db.rollback(() => {
          console.error('Error inserting batch:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        });
        return;
      }
      const batchId = batchResult.insertId;
      db.query(
        'INSERT INTO orders (batch_id, ordered_by_user_id) VALUES (?, ?)',
        [batchId, userId],
        (err, orderResult) => {
          if (err) {
            db.rollback(() => {
              console.error('Error inserting order:', err);
              res.status(500).json({ error: 'Internal Server Error' });
            });
            return;
          }
          const leadTime = 3;
          const orderId = orderResult.insertId;
          const orderItemsQueries = orderItems.map(item => {
            return new Promise((resolve, reject) => {
              db.query('INSERT INTO order_items (order_id, product_id, quantity, lead_time, received_date) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))', [orderId, item.productId, item.quantity, leadTime, leadTime], (err, result) => {
                if (err) {
                  return reject(err);
                }
                resolve(result);
              });
            });
          });

          Promise.all(orderItemsQueries)
            .then(() => {
              db.commit(err => {
                if (err) {
                  db.rollback(() => {
                    console.error('Error committing transaction:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                  });
                  return;
                }
                res.status(201).json({ message: 'Order submitted successfully', batchId });
              });
            })
            .catch(err => {
              db.rollback(() => {
                console.error('Error inserting order items:', err);
                res.status(500).json({ error: 'Internal Server Error' });
              });
            });
        });
    });
  });
});

app.get('/api/orders-by-batch', authenticateToken, async (req, res) => {
  try {
    const query = `
        SELECT 
          batches.batch_number,
          orders.id AS order_id,
          order_items.lead_time AS lead_time,
          order_items.received_date AS received_date,
          order_items.product_id,
          order_items.quantity,
          order_items.safety_stock,
          order_items.status,
          order_items.reorder_point,
          order_items.quantity_received,
          order_items.id,
          products.product_name,
          CONCAT(users.first_name, ' ', users.last_name) AS ordered_by,
          suppliers.supplier_name  AS supplier,
          orders.created_at AS created_at
        FROM batches
        JOIN orders ON orders.batch_id = batches.id
        JOIN order_items ON order_items.order_id = orders.id
        JOIN products ON order_items.product_id = products.id
        JOIN users ON orders.ordered_by_user_id = users.id
        JOIN suppliers ON products.supplier_id = suppliers.id
        ORDER BY batches.created_at DESC, orders.created_at ASC
      `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching orders by batch:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Transform results into grouped data by batch
      const ordersByBatch = results.reduce((groupedOrders, order) => {
        const batch = groupedOrders[order.batch_number] || [];
        batch.push({
          ...order,
          ordered_by: order.ordered_by,
          supplier_name: order.supplier_name
        });
        groupedOrders[order.batch_number] = batch;
        return groupedOrders;
      }, {});

      res.json(ordersByBatch);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
app.get('/api/products-by-supplier-chart/:id', authenticateToken, (req, res) => {
  const supplierId = req.params.id;

  const query = `
      SELECT product_name, product_stock
      FROM products
      WHERE supplier_id = ?
    `;

  db.query(query, [supplierId], (err, results) => {
    if (err) {
      console.error('Error fetching products by supplier:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const products = results.map((result) => ({
        product_name: result.product_name,
        quantity: result.product_stock
      }));
      res.status(200).json(products);
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
