import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import session from 'express-session';
import { MongoClient } from 'mongodb';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAccountController } from './controllers/accountController.js';
import { createOrderController } from './controllers/orderController.js';
import { createProductController } from './controllers/productController.js';
import { createAccountRoutes } from './routes/accountRoutes.js';
import { createOrderRoutes } from './routes/orderRoutes.js';
import { createProductRoutes } from './routes/productRoutes.js';
import { createCartController } from './controllers/cartController.js';
import { createCartRoutes } from './routes/cartRoutes.js';
import { getMongoConnectionString } from './mongoConnection.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const staticDirectory = path.resolve(serverDirectory, '..', 'static');
const indexFile = path.join(staticDirectory, 'index.html');

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Sessions keep login state and the shopping cart across requests.
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));

const client = new MongoClient(
  getMongoConnectionString(
    process.env.MONGODB_URI,
    process.env.MONGODB_PORT,
  ),
);

async function startServer() {
  try {
    // starts instead of reconnecting inside every request.
    await client.connect();
    const database = client.db('CS351Project2');
    // Required MongoDB collections: products, users, and orders.
    const productsCollection = database.collection('products');
    const usersCollection = database.collection('users');
    const ordersCollection = database.collection('orders');
    const countersCollection = database.collection('counters');
    const accountController = createAccountController(usersCollection);
    const productController = createProductController(productsCollection);
    const cartController = createCartController(productsCollection);
    const orderController = createOrderController(
      usersCollection,
      ordersCollection,
      productsCollection,
      countersCollection,
    );

    app.use('/api', createAccountRoutes(accountController));
    app.use('/api/orders', createOrderRoutes(orderController));
    app.use('/api/cart', createCartRoutes(cartController));
    // Product data is served from MongoDB through Express, not products.json.
    app.use('/api/products', createProductRoutes(productController));

    app.use(express.static(staticDirectory));
    if (existsSync(indexFile)) {
      app.get('/{*path}', (request, response, next) => {
        if (
          request.path === '/api' ||
          request.path.startsWith('/api/') ||
          !request.accepts('html')
        ) {
          return next();
        }

        response.sendFile(indexFile, (error) => {
          if (error) next(error);
        });
      });
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

startServer();
