require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');
const orderRoutes = require('./routes/orderRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();


app.use(cors());

// COnnection Base de donnée
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api', productRoutes);
app.use('/api', clientRoutes);
app.use('/api', orderRoutes);
app.use('/api', transactionRoutes);
app.use('/api', commentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
