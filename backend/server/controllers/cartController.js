import { randomUUID } from 'node:crypto';

const availableSizes = (product) => product.sizes || ['Small', 'Medium', 'Large'];
const roundCurrency = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

function getUnitPrice(product, size, variant) {
  const sizeMultiplier = size === 'Small' ? 0.5 : size === 'Large' ? 2 : 1;
  const variantMultiplier = variant === 'Enhanced' ? 2 : 1;
  return roundCurrency(Number(product.salePrice) * sizeMultiplier * variantMultiplier);
}

export function createCartController(productsCollection) {
  function getCart(request, response) {
    response.json({ cart: request.session.cart || [] });
  }

  async function addToCart(request, response) {
    try {
      const { productId, variant, size } = request.body;
      const parsedProductId = Number(productId);
      if (!Number.isInteger(parsedProductId) || !variant || !size) {
        return response.status(400).json({ error: 'A valid product ID, variant, and size are required' });
      }

      const product = await productsCollection.findOne({ id: parsedProductId });
      if (!product) {
        return response.status(404).json({ error: 'Product not found' });
      }
      if (!Array.isArray(product.variants) || !product.variants.includes(variant)
        || !availableSizes(product).includes(size)) {
        return response.status(400).json({ error: 'The selected product options are not available' });
      }

      const cart = request.session.cart || [];
      const matchingItem = cart.find(
        (item) => item.productId === parsedProductId && item.variant === variant && item.size === size,
      );
      const productQuantity = cart
        .filter((item) => item.productId === parsedProductId)
        .reduce((sum, item) => sum + item.quantity, 0);
      const stock = Number(product.quantityInStock);
      const quantityToAdd = Number(request.body.quantity ?? 1);
      if (!Number.isInteger(quantityToAdd) || quantityToAdd < 1) {
        return response.status(400).json({ error: 'Quantity must be a positive whole number' });
      }
      if (!Number.isFinite(stock) || productQuantity + quantityToAdd > stock) {
        return response.status(409).json({ error: 'Requested quantity exceeds available stock' });
      }

      if (matchingItem) {
        request.session.cart = cart.map((item) => item.itemId === matchingItem.itemId
          ? { ...item, quantity: item.quantity + quantityToAdd }
          : item);
      } else {
        request.session.cart = [
          ...cart,
          {
            itemId: randomUUID(),
            productId: parsedProductId,
            name: product.name,
            image: product.image,
            variant,
            size,
            salePrice: getUnitPrice(product, size, variant),
            quantityInStock: stock,
            quantity: quantityToAdd,
          },
        ];
      }
      response.status(201).json({ cart: request.session.cart });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      response.status(500).json({ error: 'Failed to add item to cart' });
    }
  }

  async function updateCartItem(request, response) {
    try {
      const { itemId } = request.params;
      const quantity = Number(request.body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return response.status(400).json({ error: 'Quantity must be a positive whole number' });
      }

      const cart = request.session.cart || [];
      const item = cart.find((entry) => entry.itemId === itemId);
      if (!item) {
        return response.status(404).json({ error: 'Cart item not found' });
      }

      const product = await productsCollection.findOne({ id: item.productId });
      if (!product) {
        return response.status(404).json({ error: 'Product not found' });
      }
      const otherQuantity = cart
        .filter((entry) => entry.productId === item.productId && entry.itemId !== itemId)
        .reduce((sum, entry) => sum + entry.quantity, 0);
      const stock = Number(product.quantityInStock);
      if (!Number.isFinite(stock) || otherQuantity + quantity > stock) {
        return response.status(409).json({ error: 'Requested quantity exceeds available stock' });
      }

      request.session.cart = cart.map((entry) => entry.itemId === itemId
        ? { ...entry, quantity, quantityInStock: stock }
        : entry);
      response.json({ cart: request.session.cart });
    } catch (error) {
      console.error('Failed to update cart item:', error);
      response.status(500).json({ error: 'Failed to update cart item' });
    }
  }

  function removeCartItem(request, response) {
    const cart = request.session.cart || [];
    if (!cart.some((item) => item.itemId === request.params.itemId)) {
      return response.status(404).json({ error: 'Cart item not found' });
    }
    request.session.cart = cart.filter((item) => item.itemId !== request.params.itemId);
    response.json({ cart: request.session.cart });
  }

  return { getCart, addToCart, updateCartItem, removeCartItem };
}
