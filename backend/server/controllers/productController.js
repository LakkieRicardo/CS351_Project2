export function createProductController(productsCollection) {
  async function getProducts(request, response) {
    try {
      const products = await productsCollection.find({}).toArray();
      response.json(products);
    } catch (error) {
      console.error('Failed to retrieve products:', error);
      response.status(500).json({ error: 'Failed to retrieve products' });
    }
  }

  async function getProductById(request, response) {
    try {
      const productId = Number(request.params.id);
      if (!Number.isInteger(productId)) {
        return response.status(400).json({ error: 'Product ID must be a number' });
      }
      const product = await productsCollection.findOne({ id: productId });
      if (!product) {
        return response.status(404).json({ error: 'Product not found' });
      }
      response.json(product);
    } catch (error) {
      console.error('Failed to retrieve product:', error);
      response.status(500).json({ error: 'Failed to retrieve product' });
    }
  }

  return { getProducts, getProductById };
}
