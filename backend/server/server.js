import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { createProductController } from './controllers/productController.js';
import { createProductRoutes } from './routes/productRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
  try {
    await client.connect();
    const database = client.db('CS351Project2');
    const productsCollection = database.collection('products');
    const productController = createProductController(productsCollection);

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
