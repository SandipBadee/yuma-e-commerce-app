require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require('./swagger');

// Import authentication routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const homeRoutes = require('./routes/homeRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Standard Middleware
app.use(cors());
app.use(express.json());

// Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
// This connects your authRoutes to the /api/auth prefix
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/orders', orderRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Using a hardcoded port 5000 as requested
const PORT = 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Catch any unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});