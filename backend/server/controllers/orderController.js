import { ObjectId } from 'mongodb';

const roundCurrency = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;
const availableSizes = (product) => product.sizes || ['Small', 'Medium', 'Large'];

function getUnitPrice(product, size, variant) {
  const sizeMultiplier = size === 'Small' ? 0.5 : size === 'Large' ? 2 : 1;
  const variantMultiplier = variant === 'Enhanced' ? 2 : 1;
  return roundCurrency(Number(product.salePrice) * sizeMultiplier * variantMultiplier);
}

function hasCompleteCheckoutProfile(user) {
  const address = user.shippingAddress || {};
  const phoneDigits = String(user.phone || '').replace(/\D/g, '');
  return Boolean(
    user.email
    && phoneDigits.length >= 10
    && address.street?.trim()
    && address.city?.trim()
    && /^[A-Za-z]{2}$/.test(address.state || '')
    && /^\d{5}(?:-\d{4})?$/.test(address.zip || ''),
  );
}

export function createOrderController(usersCollection, ordersCollection, productsCollection, countersCollection) {
  async function createOrder(request, response) {
    try {
      if (!request.session.userId || !ObjectId.isValid(request.session.userId)) {
        return response.status(401).json({ error: 'You must be logged in to place an order' });
      }
      const firstName = typeof request.body.firstName === 'string' ? request.body.firstName.trim() : '';
      const lastName = typeof request.body.lastName === 'string' ? request.body.lastName.trim() : '';
      if (!firstName || firstName.length > 50 || !lastName || lastName.length > 50) {
        return response.status(400).json({ error: 'First and last name are required and must be 50 characters or fewer' });
      }

      const cart = request.session.cart || [];
      if (cart.length === 0) {
        return response.status(400).json({ error: 'Your cart is empty' });
      }

      const user = await usersCollection.findOne({ _id: new ObjectId(request.session.userId) });
      if (!user) {
        return response.status(404).json({ error: 'Account not found' });
      }
      if (!hasCompleteCheckoutProfile(user)) {
        return response.status(400).json({
          error: 'Complete your profile with a valid phone number and shipping address before checkout',
        });
      }

      const quantitiesByProduct = new Map();
      for (const item of cart) {
        quantitiesByProduct.set(
          item.productId,
          (quantitiesByProduct.get(item.productId) || 0) + item.quantity,
        );
      }

      const products = await Promise.all(
        [...quantitiesByProduct.keys()].map((productId) => productsCollection.findOne({ id: productId })),
      );
      const productById = new Map(products.filter(Boolean).map((product) => [product.id, product]));
      for (const [productId, quantity] of quantitiesByProduct) {
        const product = productById.get(productId);
        if (!product) {
          return response.status(409).json({ error: `Product ${productId} is no longer available` });
        }
        if (!Number.isFinite(Number(product.quantityInStock)) || quantity > Number(product.quantityInStock)) {
          return response.status(409).json({ error: `${product.name} does not have enough stock` });
        }
      }

      const orderItems = cart.map((item) => {
        const product = productById.get(item.productId);
        if (!product.variants?.includes(item.variant) || !availableSizes(product).includes(item.size)) {
          return null;
        }
        const unitPrice = getUnitPrice(product, item.size, item.variant);
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          return null;
        }
        return {
          productId: product.id,
          name: product.name,
          image: product.image,
          variant: item.variant,
          size: item.size,
          unitPrice,
          quantity: item.quantity,
          lineTotal: roundCurrency(unitPrice * item.quantity),
        };
      });
      if (orderItems.some((item) => item === null)) {
        return response.status(409).json({ error: 'A cart item is no longer available with the selected options' });
      }

      const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = roundCurrency(
        orderItems.reduce((sum, item) => sum + item.lineTotal, 0),
      );
      const shipping = roundCurrency(itemCount * 10);
      const taxes = roundCurrency(subtotal * 0.08);
      const total = roundCurrency(subtotal + shipping + taxes);
      await countersCollection.updateOne(
        { _id: 'order-counter' },
        { $setOnInsert: { sequence: 1000 } },
        { upsert: true },
      );
      const counterResult = await countersCollection.findOneAndUpdate(
        { _id: 'order-counter' },
        { $inc: { sequence: 1 } },
        { returnDocument: 'after' },
      );
      const counter = counterResult.value || counterResult;
      const order = {
        _id: `ORD-${counter.sequence}`,
        userId: user._id.toString(),
        orderDate: new Date(),
        customer: {
          firstName,
          lastName,
          email: user.email,
          phone: user.phone,
        },
        shippingAddress: { ...user.shippingAddress },
        items: orderItems,
        totals: { subtotal, shipping, taxes, total, itemCount },
      };

      await ordersCollection.insertOne(order);
      request.session.cart = [];
      response.status(201).json({
        message: 'Order created successfully',
        order,
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      response.status(500).json({ error: 'Failed to create order' });
    }
  }

  async function getOrders(request, response) {
    try {
      if (!request.session.userId || !ObjectId.isValid(request.session.userId)) {
        return response.status(401).json({ error: 'You must be logged in to view orders' });
      }
      const orders = await ordersCollection
        .find({ userId: request.session.userId })
        .sort({ orderDate: -1 })
        .toArray();
      response.json({ orders });
    } catch (error) {
      console.error('Failed to retrieve orders:', error);
      response.status(500).json({ error: 'Failed to retrieve orders' });
    }
  }

  async function getOrderById(request, response) {
    try {
      if (!request.session.userId || !ObjectId.isValid(request.session.userId)) {
        return response.status(401).json({ error: 'You must be logged in to view orders' });
      }
      if (!/^ORD-\d+$/.test(request.params.id)) {
        return response.status(400).json({ error: 'Invalid order ID' });
      }
      const order = await ordersCollection.findOne({
        _id: request.params.id,
        userId: request.session.userId,
      });
      if (!order) {
        return response.status(404).json({ error: 'Order not found' });
      }
      response.json({ order });
    } catch (error) {
      console.error('Failed to retrieve order:', error);
      response.status(500).json({ error: 'Failed to retrieve order' });
    }
  }

  return { createOrder, getOrders, getOrderById };
}
