const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

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
    next();
  });
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
      const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token });
    });
  });
});

// API mẫu test
app.get('/', (req, res) => {
  res.send('Server chạy ngon!');
});

// API lấy tất cả sản phẩm (không cần auth)
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Lỗi server' });
    } else {
      res.json(results);
    }
  });
});

// API lấy chi tiết 1 sản phẩm (không cần auth)
app.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Lỗi server' });
    } else if (result.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    } else {
      res.json(result[0]);
    }
  });
});

// API tạo đơn hàng (yêu cầu auth)
app.post('/orders', authenticate, (req, res) => {
  const { address, cartItems } = req.body;
  const userId = req.userId;
  if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Giỏ hàng trống' });
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  db.query('SELECT full_name, address as user_address FROM users WHERE id = ?', [userId], (err, userResults) => {
    if (err || userResults.length === 0) return res.status(500).json({ error: 'Error fetching user details' });
    const user = userResults[0];
    const shippingAddress = address || user.user_address;
    if (!shippingAddress) return res.status(400).json({ error: 'Shipping address is required' });
    db.query('INSERT INTO orders (user_id, user_name, address, total_price) VALUES (?, ?, ?, ?)',
      [userId, user.full_name, shippingAddress, totalPrice],
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

// API lấy tất cả đơn hàng của user (yêu cầu auth)
app.get('/orders', authenticate, (req, res) => {
  const userId = req.userId;
  const query = `
    SELECT 
      o.id, 
      o.user_name, 
      o.address, 
      o.total_price, 
      o.created_at 
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi lấy đơn hàng' });
    res.json(results);
  });
});

// API lấy chi tiết 1 đơn hàng (yêu cầu auth)
app.get('/orders/:id', authenticate, (req, res) => {
  const orderId = req.params.id;
  const userId = req.userId;
  db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId], (err, orderResult) => {
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

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});