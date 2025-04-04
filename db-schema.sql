-- Create database
CREATE DATABASE IF NOT EXISTS hungry_heads;
USE hungry_heads;

-- Create Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    number_of_guests INT NOT NULL,
    food_preference ENUM('veg', 'non-veg') NOT NULL,
    seating_preference ENUM('Indoor', 'Outdoor', 'Window View') NOT NULL,
    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed'
);

-- Create Delivery Orders table
CREATE TABLE IF NOT EXISTS delivery_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    delivery_address TEXT NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi') NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('placed', 'processing', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'placed'
);

-- Create Order Items table (for items in each delivery order)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES delivery_orders(id) ON DELETE CASCADE
);