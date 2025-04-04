const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// More permissive CORS configuration for development
app.use(cors());  // This allows all origins during development

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from public directory

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Krishna#9175', // Replace with your database password
  database: 'hungry_heads'
};

// Create database pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// API endpoint for reservations
app.post('/api/reservations', async (req, res) => {
  console.log('Received reservation request:', req.body);
  try {
    const { name, contact, members, food, seating } = req.body;
    
    // Validate input
    if (!name || !contact || !members || !food || !seating) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    const connection = await pool.getConnection();
    const query = `
      INSERT INTO reservations 
      (full_name, contact_number, number_of_guests, food_preference, seating_preference) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await connection.execute(query, [name, contact, members, food, seating]);
    connection.release();
    
    res.status(200).json({ 
      success: true, 
      message: 'Reservation successful!' 
    });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your reservation.' 
    });
  }
});

// API endpoint for delivery orders
app.post('/api/orders', async (req, res) => {
  try {
    const { name, address, phone, payment, orderItems } = req.body;
    const items = JSON.parse(orderItems);
    
    // Validate input
    if (!name || !address || !phone || !payment || !items.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required and order must contain at least one item' 
      });
    }
    
    const connection = await pool.getConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    try {
      // Insert order
      const orderQuery = `
        INSERT INTO delivery_orders 
        (full_name, delivery_address, phone_number, payment_method) 
        VALUES (?, ?, ?, ?)
      `;
      
      const [orderResult] = await connection.execute(orderQuery, [name, address, phone, payment]);
      const orderId = orderResult.insertId;
      
      // Insert order items
      const itemQuery = `
        INSERT INTO order_items 
        (order_id, item_name) 
        VALUES (?, ?)
      `;
      
      for (const item of items) {
        await connection.execute(itemQuery, [orderId, item]);
      }
      
      // Commit transaction
      await connection.commit();
      connection.release();
      
      res.status(200).json({ 
        success: true, 
        message: 'Order placed successfully!' 
      });
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while processing your order.' 
    });
  }
});

// Start server
app.listen(PORT, async () => {
  await testConnection();
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes