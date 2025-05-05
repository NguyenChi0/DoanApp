const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
const db = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Chi23324',
  database: 'banhang'
});

db.connect(err => {
  if (err) {
    console.log('Kết nối thất bại', err);
  } else {
    console.log('Kết nối thành công tới MySQL');
  }
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.userRole !== 1) {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  next();
};

// Register endpoint
app.post('/register', (req, res) => {
  const { username, password, email, full_name, address } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email are required' });
  }
  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) return res.status(400).json({ error: 'Username or email already exists' });
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Error hashing password' });
      db.query('INSERT INTO users (username, password, email, full_name, address) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, email, full_name || null, address || null],
        (err, result) => {
          if (err) return res.status(500).json({ error: 'Error creating user' });
          res.status(201).json({ message: 'User created successfully' });
        }
      );
    });
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid username or password' });
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error comparing passwords' });
      if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });
      const token = jwt.sign({ userId: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          full_name: user.full_name, 
          address: user.address,
          role: user.role 
        } 
      });
    });
  });
});

// Update user endpoint
app.put('/users/:id', authenticate, (req, res) => {
  const userId = req.params.id;
  const { full_name, address, email, password } = req.body;
  if (req.userId !== parseInt(userId)) return res.status(403).json({ error: 'Unauthorized' });

  let query = 'UPDATE users SET ';
  const values = [];
  const updates = [];

  if (full_name) {
    updates.push('full_name = ?');
    values.push(full_name);
  }
  if (address) {
    updates.push('address = ?');
    values.push(address);
  }
  if (email) {
    updates.push('email = ?');
    values.push(email);
  }
  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Error hashing password' });
      updates.push('password = ?');
      values.push(hashedPassword);
      query += updates.join(', ') + ' WHERE id = ?';
      values.push(userId);
      db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error updating user' });
        res.json({ message: 'User updated successfully' });
      });
    });
    return;
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });
  query += updates.join(', ') + ' WHERE id = ?';
  values.push(userId);
  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: 'Error updating user' });
    res.json({ message: 'User updated successfully' });
  });
});

// API mẫu test
app.get('/', (req, res) => {
  res.send('Server chạy ngon!');
});

// API lấy tất cả danh mục
app.get('/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Lỗi server' });
    } else {
      res.json(results);
    }
  });
});

// API lấy tất cả sản phẩm (không cần auth)
app.get('/products', (req, res) => {
  const { category_id } = req.query;
  let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
  const values = [];
  if (category_id) {
    query += ' WHERE p.category_id = ?';
    values.push(category_id);
  }
  db.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Lỗi server' });
    } else {
      const baseImageUrl = 'http://192.168.43.49:3000'; // Đảm bảo khớp với địa chỉ server
      const productsWithImageUrl = results.map(product => ({
        ...product,
        image: product.image && !product.image.startsWith('http')
          ? `${baseImageUrl}/${product.image}`
          : product.image,
      }));
      res.json(productsWithImageUrl);
    }
  });
});

// API lấy chi tiết 1 sản phẩm (không cần auth)
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [productId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Lỗi server' });
    } else if (result.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    } else {
      res.json(result[0]);
    }
  });
});

// API thêm sản phẩm (chỉ admin)
app.post('/products', authenticate, isAdmin, (req, res) => {
  const { name, description, price, image, stock, category_id } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Tên và giá sản phẩm là bắt buộc' });
  }
  
  const query = 'INSERT INTO products (name, description, price, image, stock, category_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [name, description, price, image, stock || 0, category_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi server khi thêm sản phẩm' });
    }
    res.status(201).json({ id: result.insertId, message: 'Thêm sản phẩm thành công' });
  });
});

// API xóa sản phẩm (chỉ admin)
app.delete('/products/:id', authenticate, isAdmin, (req, res) => {
  const productId = req.params.id;
  
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi server' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    
    db.query('DELETE FROM products WHERE id = ?', [productId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Lỗi server khi xóa sản phẩm' });
      }
      res.json({ message: 'Xóa sản phẩm thành công' });
    });
  });
});

// API tạo đơn hàng (yêu cầu auth)
app.post('/orders', authenticate, (req, res) => {
  const { address, phoneNumber, cartItems } = req.body;
  
  const userId = req.userId;
  if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Giỏ hàng trống' });
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  db.query('SELECT full_name, address as user_address FROM users WHERE id = ?', [userId], (err, userResults) => {
    if (err || userResults.length === 0) return res.status(500).json({ error: 'Error fetching user details' });
    const user = userResults[0];
    const shippingAddress = address || user.user_address;
    if (!shippingAddress) return res.status(400).json({ error: 'Shipping address is required' });
    
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });
    
    db.query('INSERT INTO orders (user_id, user_name, address, phone_number, total_price, status) VALUES (?, ?, ?, ?, ?, 0)',
      [userId, user.full_name, shippingAddress, phoneNumber, totalPrice],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Lỗi server khi tạo đơn hàng' });
        const orderId = result.insertId;
        const orderItems = cartItems.map(item => [orderId, item.id, item.quantity, item.price]);
        db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?', [orderItems], (err2) => {
          if (err2) return res.status(500).json({ error: 'Lỗi server khi tạo chi tiết đơn hàng' });
          res.json({ message: 'Đặt hàng thành công', orderId: orderId });
        });
      }
    );
  });
});

// API lấy tất cả đơn hàng (admin thấy tất cả, user thấy của mình)
app.get('/orders', authenticate, (req, res) => {
  const userId = req.userId;
  const isAdminUser = req.userRole === 1;
  let query = `
    SELECT 
      o.id, 
      o.user_name, 
      o.address, 
      o.phone_number,
      o.total_price, 
      o.created_at,
      o.status
    FROM orders o
  `;
  const values = [];
  
  if (!isAdminUser) {
    query += ' WHERE o.user_id = ?';
    values.push(userId);
  }
  
  query += ' ORDER BY o.created_at DESC';
  
  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy đơn hàng' });
    res.json(results);
  });
});

// API lấy chi tiết 1 đơn hàng (admin thấy tất cả, user thấy của mình)
app.get('/orders/:id', authenticate, (req, res) => {
  const orderId = req.params.id;
  const userId = req.userId;
  const isAdminUser = req.userRole === 1;
  
  let query = 'SELECT * FROM orders WHERE id = ?';
  const values = [orderId];
  
  if (!isAdminUser) {
    query += ' AND user_id = ?';
    values.push(userId);
  }
  
  db.query(query, values, (err, orderResult) => {
    if (err) return res.status(500).json({ error: 'Lỗi server' });
    if (orderResult.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    const detailsQuery = `
      SELECT 
        oi.*, 
        p.name as product_name,
        p.image as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    db.query(detailsQuery, [orderId], (err, itemsResult) => {
      if (err) return res.status(500).json({ error: 'Lỗi server khi lấy chi tiết đơn hàng' });
      res.json({ order: orderResult[0], items: itemsResult });
    });
  });
});

// API cập nhật trạng thái đơn hàng (chỉ admin)
app.put('/orders/:id/status', authenticate, isAdmin, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  if (status === undefined) return res.status(400).json({ error: 'Trạng thái là bắt buộc' });
  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    res.json({ message: 'Cập nhật trạng thái thành công' });
  });
});

// API quản lý danh mục
app.get('/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Lỗi server' });
    } else {
      res.json(results);
    }
  });
});

app.post('/categories', authenticate, isAdmin, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
  db.query('INSERT INTO categories (name) VALUES (?)', [name], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi thêm danh mục' });
    res.status(201).json({ id: result.insertId, message: 'Thêm danh mục thành công' });
  });
});

app.put('/categories/:id', authenticate, isAdmin, (req, res) => {
  const categoryId = req.params.id;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
  db.query('UPDATE categories SET name = ? WHERE id = ?', [name, categoryId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật danh mục' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    res.json({ message: 'Cập nhật danh mục thành công' });
  });
});

app.delete('/categories/:id', authenticate, isAdmin, (req, res) => {
  const categoryId = req.params.id;
  db.query('SELECT * FROM products WHERE category_id = ?', [categoryId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi server' });
    if (result.length > 0) return res.status(400).json({ error: 'Không thể xóa danh mục có sản phẩm' });
    db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Lỗi server khi xóa danh mục' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
      res.json({ message: 'Xóa danh mục thành công' });
    });
  });
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});