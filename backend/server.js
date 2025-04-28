const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000; // Server chạy cổng 3000

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Kết nối Database
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

// API mẫu test
app.get('/', (req, res) => {
  res.send('Server chạy ngon!');
});

// API lấy tất cả sản phẩm
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Lỗi server' });
      } else {
        res.json(results);
      }
    });
  });  

// API lấy chi tiết 1 sản phẩm
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
  
// API tạo đơn hàng
app.post('/orders', (req, res) => {
    const { user_name, address, cartItems } = req.body;
  
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Giỏ hàng trống' });
    }
  
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
    // Thêm vào bảng orders
    db.query('INSERT INTO orders (user_name, address, total_price) VALUES (?, ?, ?)', [user_name, address, totalPrice], (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Lỗi server khi tạo đơn hàng' });
      } else {
        const orderId = result.insertId;
        
        // Thêm từng sản phẩm vào order_items
        const orderItems = cartItems.map(item => [orderId, item.id, item.quantity, item.price]);
        db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?', [orderItems], (err2) => {
          if (err2) {
            res.status(500).json({ error: 'Lỗi server khi tạo chi tiết đơn hàng' });
          } else {
            res.json({ message: 'Đặt hàng thành công', orderId: orderId });
          }
        });
      }
    });
  });

// API lấy tất cả đơn hàng
app.get('/orders', (req, res) => {
  const query = `
    SELECT 
      o.id, 
      o.user_name, 
      o.address, 
      o.total_price, 
      o.created_at 
    FROM orders o
    ORDER BY o.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Lỗi server khi lấy đơn hàng' });
    } else {
      res.json(results);
    }
  });
});

// API lấy chi tiết 1 đơn hàng kèm các sản phẩm
app.get('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
  // Lấy thông tin đơn hàng
  db.query('SELECT * FROM orders WHERE id = ?', [orderId], (err, orderResult) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi server' });
    }
    
    if (orderResult.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Lấy chi tiết các sản phẩm trong đơn hàng
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
      if (err) {
        return res.status(500).json({ error: 'Lỗi server khi lấy chi tiết đơn hàng' });
      }
      
      // Trả về kết quả gồm thông tin đơn hàng và chi tiết sản phẩm
      res.json({
        order: orderResult[0],
        items: itemsResult
      });
    });
  });
});
  
app.listen(port, () => {
  console.log(`Server chạy tại http://localhost:${port}`);
});