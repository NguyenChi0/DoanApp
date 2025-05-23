const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'images')); // Save uploaded images to the 'images' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  }
});

const upload = multer({ storage: storage });

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
  let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 1';
  const values = [];
  if (category_id) {
    query += ' AND p.category_id = ?';
    values.push(category_id);
  }
  db.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Lỗi server' });
    } else {
      const baseImageUrl = 'http://192.168.52.114:3000';
      const productsWithImageUrl = results.map(product => ({
        ...product,
        image: product.image
          ? (product.image.startsWith('http')
              ? product.image
              : `${baseImageUrl}/images/${product.image}`)
          : null,
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
      const baseImageUrl = 'http://192.168.52.114:3000';
      const product = {
        ...result[0],
        image: result[0].image
          ? (result[0].image.startsWith('http')
              ? result[0].image
              : `${baseImageUrl}/images/${result[0].image}`)
          : null,
      };
      res.json(product);
    }
  });
});

// API thêm sản phẩm (chỉ admin)
app.post('/products', authenticate, isAdmin, upload.single('image'), (req, res) => {
  const { name, description, price, stock, category_id } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price) {
    return res.status(400).json({ error: 'Tên và giá sản phẩm là bắt buộc' });
  }

  const query = 'INSERT INTO products (name, description, price, image, stock, category_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [name, description, price, image, stock || 0, category_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi server khi thêm sản phẩm' });
    }
    const baseImageUrl = 'http://192.168.52.114:3000';
    const imageUrl = image ? `${baseImageUrl}/images/${image}` : null;
    res.status(201).json({
      id: result.insertId,
      message: 'Thêm sản phẩm thành công',
      product: {
        id: result.insertId,
        name,
        description,
        price: parseFloat(price),
        image: imageUrl,
        stock: parseInt(stock) || 0,
        category_id: category_id ? parseInt(category_id) : null,
      },
    });
  });
});

// API cập nhật sản phẩm (chỉ admin)
app.put('/products/:id', authenticate, isAdmin, upload.single('image'), (req, res) => {
  const productId = req.params.id;
  const { name, description, price, stock, category_id } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price) {
    return res.status(400).json({ error: 'Tên và giá sản phẩm là bắt buộc' });
  }

  // Kiểm tra sản phẩm tồn tại
  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi server' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    const oldProduct = result[0];
    
    // Xây dựng câu lệnh UPDATE
    let query = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?';
    const values = [name, description || null, price, stock || 0];
    
    if (category_id) {
      query += ', category_id = ?';
      values.push(category_id);
    }
    
    if (image) {
      query += ', image = ?';
      values.push(image);
    }
    
    query += ' WHERE id = ?';
    values.push(productId);
    
    db.query(query, values, (err, updateResult) => {
      if (err) {
        return res.status(500).json({ error: 'Lỗi server khi cập nhật sản phẩm' });
      }
      
      const baseImageUrl = 'http://192.168.52.114:3000';
      const updatedImage = image 
        ? `${baseImageUrl}/images/${image}` 
        : oldProduct.image 
          ? (oldProduct.image.startsWith('http') 
              ? oldProduct.image 
              : `${baseImageUrl}/images/${oldProduct.image}`)
          : null;
      
      res.json({
        message: 'Cập nhật sản phẩm thành công',
        product: {
          id: parseInt(productId),
          name,
          description: description || null,
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          category_id: category_id ? parseInt(category_id) : oldProduct.category_id,
          image: updatedImage
        }
      });
    });
  });
});

app.delete('/products/:id', authenticate, isAdmin, (req, res) => {
  const productIdStr = req.params.id;
  const productId = parseInt(productIdStr, 10);
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'ID sản phẩm không hợp lệ' });
  }
  console.log('Đang thử ẩn sản phẩm với ID:', productId);

  db.query('SELECT * FROM products WHERE id = ?', [productId], (err, result) => {
    if (err) {
      console.error('Lỗi khi truy vấn sản phẩm:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    db.query('UPDATE products SET status = 0 WHERE id = ?', [productId], (err) => {
      if (err) {
        console.error('Lỗi khi ẩn sản phẩm:', err);
        return res.status(500).json({ error: 'Lỗi server khi ẩn sản phẩm' });
      }
      res.json({ message: 'Đã ẩn sản phẩm thành công' });
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
      const baseImageUrl = 'http://192.168.52.114:3000';
      const itemsWithImageUrl = itemsResult.map(item => ({
        ...item,
        product_image: item.product_image
          ? (item.product_image.startsWith('http')
              ? item.product_image
              : `${baseImageUrl}/images/${item.product_image}`)
          : null,
      }));
      res.json({ order: orderResult[0], items: itemsWithImageUrl });
    });
  });
});

// API cập nhật trạng thái đơn hàng (chỉ admin)
app.put('/orders/:id/status', authenticate, isAdmin, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  
  if (status === undefined) return res.status(400).json({ error: 'Trạng thái là bắt buộc' });
  
  // Check if status is valid (0: pending, 1: shipping, 2: delivered, 3: cancelled)
  if (![0, 1, 2, 3].includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }
  
  // First check the current status
  db.query('SELECT status FROM orders WHERE id = ?', [orderId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi kiểm tra trạng thái' });
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    
    const currentStatus = results[0].status;
    
    // Cannot update cancelled orders
    if (currentStatus === 3) {
      return res.status(400).json({ error: 'Không thể cập nhật đơn hàng đã hủy' });
    }
    
    // Cannot update delivered orders except to cancel them
    if (currentStatus === 2 && status !== 3) {
      return res.status(400).json({ error: 'Không thể cập nhật đơn hàng đã giao' });
    }
    
    // Update the status
    db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      res.json({ message: 'Cập nhật trạng thái thành công' });
    });
  });
});

// API for users to cancel their own orders (only if status is pending/0)
app.put('/orders/:id/cancel', authenticate, (req, res) => {
  const orderId = req.params.id;
  const userId = req.userId;
  
  // First check if the order belongs to the user and is in a cancellable state
  db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi kiểm tra đơn hàng' });
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    
    const order = results[0];
    // Can only cancel if the order is still pending (status 0)
    if (order.status !== 0) {
      return res.status(400).json({ 
        error: 'Không thể huỷ đơn hàng',
        message: 'Đơn hàng đã được xử lý và không thể huỷ'
      });
    }
    
    // Update order status to cancelled (3)
    db.query('UPDATE orders SET status = 3 WHERE id = ?', [orderId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Lỗi server khi huỷ đơn hàng' });
      res.json({ message: 'Đơn hàng đã được huỷ thành công' });
    });
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

// API lấy doanh thu theo tháng (chỉ admin)
app.get('/revenue/monthly', authenticate, isAdmin, (req, res) => {
  const query = `
    SELECT 
      YEAR(created_at) as year,
      MONTH(created_at) as month,
      SUM(total_price) as revenue
    FROM orders
    WHERE status = 2
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY year DESC, month DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu doanh thu' });
    }
    res.json(results);
  });
});

// API lấy tất cả user (chỉ admin)
app.get('/users', authenticate, isAdmin, (req, res) => {
  db.query('SELECT id, username, email, full_name, address, created_at, role FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi server khi lấy danh sách user' });
    }
    res.json(results);
  });
});

// API thêm user (chỉ admin, hỗ trợ tạo tài khoản admin)
app.post('/users', authenticate, isAdmin, (req, res) => {
  const { username, password, email, full_name, address, role } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, và email là bắt buộc' });
  }
  db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi server' });
    if (results.length > 0) return res.status(400).json({ error: 'Username hoặc email đã tồn tại' });
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi mã hóa mật khẩu' });
      db.query('INSERT INTO users (username, password, email, full_name, address, role) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, email, full_name || null, address || null, role || 0],
        (err, result) => {
          if (err) return res.status(500).json({ error: 'Lỗi khi tạo user' });
          res.status(201).json({ message: 'Tạo user thành công', id: result.insertId });
        }
      );
    });
  });
});

// API cập nhật user (chỉ admin)
app.put('/users/:id', authenticate, isAdmin, (req, res) => {
  const userId = req.params.id;
  const { username, email, full_name, address, password, role } = req.body;

  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi server' });
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy user' });

    let query = 'UPDATE users SET ';
    const values = [];
    const updates = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (full_name) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (address) {
      updates.push('address = ?');
      values.push(address);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }

    if (password) {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Lỗi khi mã hóa mật khẩu' });
        updates.push('password = ?');
        values.push(hashedPassword);
        query += updates.join(', ') + ' WHERE id = ?';
        values.push(userId);
        db.query(query, values, (err, result) => {
          if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật user' });
          res.json({ message: 'Cập nhật user thành công' });
        });
      });
      return;
    }

    if (updates.length === 0) return res.status(400).json({ error: 'Không có thông tin cập nhật' });
    query += updates.join(', ') + ' WHERE id = ?';
    values.push(userId);
    db.query(query, values, (err, result) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật user' });
      res.json({ message: 'Cập nhật user thành công' });
    });
  });
});

// Xóa user 
app.delete('/users/:id', authenticate, isAdmin, (req, res) => {
  const userId = req.params.id;
  
  // Kiểm tra xem user có đơn hàng không
  db.query('SELECT * FROM orders WHERE user_id = ?', [userId], (err, orderResults) => {
    if (err) return res.status(500).json({ error: 'Lỗi server khi kiểm tra đơn hàng' });
    
    // Nếu người dùng đã có đơn hàng, không cho phép xóa
    if (orderResults.length > 0) {
      return res.status(400).json({ 
        error: 'Không thể xóa user này vì đã có đơn hàng trong hệ thống',
        hasOrders: true 
      });
    }
    
    // Nếu không có đơn hàng, tiếp tục với việc xóa user
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Lỗi server' });
      if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy user' });
      
      db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Tài khoản đã phát sinh đơn hàng, không thể xóa' });
        res.json({ message: 'Xóa user thành công' });
      });
    });
  });
});

// Get reviews for a specific product
app.get('/products/:id/reviews', (req, res) => {
  const productId = req.params.id;
  
  // Query to get reviews with user information
  const query = `
    SELECT r.id, r.rating, r.comment, r.created_at, 
           u.id as user_id, u.username, u.full_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `;
  
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải đánh giá' });
    }
    
    res.json(results);
  });
});

app.post('/products/:id/reviews', authenticate, (req, res) => {
  const productId = req.params.id;
  const userId = req.userId; // Lấy từ JWT token
  const { rating, comment } = req.body;

  // Kiểm tra đầu vào
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
  }

  // Kiểm tra xem người dùng có đơn hàng đã giao cho sản phẩm này không
  const checkOrderQuery = `
    SELECT o.id
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 2
    LIMIT 1
  `;

  db.query(checkOrderQuery, [userId, productId], (err, results) => {
    if (err) {
      console.error('Lỗi khi kiểm tra đơn hàng:', err);
      return res.status(500).json({ message: 'Đã xảy ra lỗi khi kiểm tra đơn hàng' });
    }

    if (results.length === 0) {
      return res.status(403).json({ message: 'Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được giao' });
    }

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    db.query(
      'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId],
      (err, results) => {
        if (err) {
          console.error('Lỗi khi kiểm tra đánh giá:', err);
          return res.status(500).json({ message: 'Đã xảy ra lỗi' });
        }

        if (results.length > 0) {
          // Cập nhật đánh giá hiện có
          db.query(
            'UPDATE reviews SET rating = ?, comment = ?, created_at = NOW() WHERE user_id = ? AND product_id = ?',
            [rating, comment, userId, productId],
            (err) => {
              if (err) {
                console.error('Lỗi khi cập nhật đánh giá:', err);
                return res.status(500).json({ message: 'Không thể cập nhật đánh giá' });
              }
              res.json({ message: 'Đánh giá đã được cập nhật' });
            }
          );
        } else {
          // Tạo đánh giá mới
          db.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
            [userId, productId, rating, comment],
            (err) => {
              if (err) {
                console.error('Lỗi khi tạo đánh giá:', err);
                return res.status(500).json({ message: 'Không thể tạo đánh giá' });
              }
              res.status(201).json({ message: 'Đánh giá đã được tạo' });
            }
          );
        }
      }
    );
  });
});

// Delete a review (requires authentication)
app.delete('/reviews/:id', authenticate, (req, res) => {
  const reviewId = req.params.id;
  const userId = req.userId; // From the JWT token
  
  // Check if the review belongs to the user or user is admin
  db.query(
    'SELECT user_id FROM reviews WHERE id = ?',
    [reviewId],
    (err, results) => {
      if (err) {
        console.error('Error checking review ownership:', err);
        return res.status(500).json({ message: 'Đã xảy ra lỗi' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
      }
      
      // Check if the user is the owner or admin
      if (results[0].user_id !== userId && req.userRole !== 1) {
        return res.status(403).json({ message: 'Không có quyền xóa đánh giá này' });
      }
      
      // Delete the review
      db.query('DELETE FROM reviews WHERE id = ?', [reviewId], (err) => {
        if (err) {
          console.error('Error deleting review:', err);
          return res.status(500).json({ message: 'Không thể xóa đánh giá' });
        }
        
        res.json({ message: 'Đánh giá đã được xóa' });
      });
    }
  );
});

app.get('/admin/reviews', authenticate, (req, res) => {
  if (req.userRole !== 1) {
    return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
  }

  const query = `
    SELECT r.id, r.rating, r.comment, r.created_at, 
           u.id as user_id, u.username, u.full_name,
           p.id as product_id, p.name as product_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    JOIN products p ON r.product_id = p.id
    ORDER BY r.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all reviews:', err);
      return res.status(500).json({ message: 'Đã xảy ra lỗi khi tải đánh giá' });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});
