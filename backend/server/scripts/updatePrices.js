import dotenv from 'dotenv';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { getMongoConnectionString } from '../mongoConnection.js';
import { normalizePrice } from '../priceUtils.js';

dotenv.config();

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const productsJsonPath = path.resolve(scriptDirectory, '..', '..', '..', 'frontend', 'client', 'public', 'products.json');

async function updateJsonCatalog() {
  const products = JSON.parse(await readFile(productsJsonPath, 'utf8'));
  const updatedProducts = products.map((product) => ({
    ...product,
    price: normalizePrice(product.price),
    salePrice: normalizePrice(product.salePrice),
  }));

  await writeFile(productsJsonPath, `${JSON.stringify(updatedProducts, null, 4)}\n`, 'utf8');
  console.log(`Updated ${updatedProducts.length} products in products.json.`);
}

async function updateMongoCatalog() {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI is not set; skipping MongoDB price updates.');
    return;
  }

  const client = new MongoClient(
    getMongoConnectionString(process.env.MONGODB_URI, process.env.MONGODB_PORT),
  );

  try {
    await client.connect();
    const products = client.db('CS351Project2').collection('products');
    const catalog = await products.find({}, { projection: { _id: 1, price: 1, salePrice: 1 } }).toArray();
    const operations = catalog.map((product) => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            price: normalizePrice(product.price),
            salePrice: normalizePrice(product.salePrice),
          },
        },
      },
    }));

    if (operations.length > 0) {
      const result = await products.bulkWrite(operations);
      console.log(`Updated ${result.modifiedCount} MongoDB products.`);
    } else {
      console.log('No MongoDB products found.');
    }
  } finally {
    await client.close();
  }
}

await updateJsonCatalog();
await updateMongoCatalog();
