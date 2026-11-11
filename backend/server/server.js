import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { MongoClient } from 'mongodb';
import { createAccountController } from './controllers/accountController.js';
import { createProductController } from './controllers/productController.js';
import { createAccountRoutes } from './routes/accountRoutes.js';
import { createProductRoutes } from './routes/productRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Project 2 requirement: use Express sessions so login state and the future
// shopping cart can persist across requests for the current browser session.
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));

const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
  try {
    // starts instead of reconnecting inside every request.
    await client.connect();
    const database = client.db('CS351Project2');
    // Required MongoDB collections: products, users, and orders.
    const productsCollection = database.collection('products');
    const usersCollection = database.collection('users');
    const accountController = createAccountController(usersCollection);
    const productController = createProductController(productsCollection);

    app.use('/api', createAccountRoutes(accountController));
    // Product data is served from MongoDB through Express, not products.json.
    app.use('/api/products', createProductRoutes(productController));

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer();
