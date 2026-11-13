import { Router } from 'express';

export function createCartRoutes(cartController) {
  const router = Router();
  router.get('/', cartController.getCart);
  router.post('/', cartController.addToCart);
  router.put('/:itemId', cartController.updateCartItem);
  router.delete('/:itemId', cartController.removeCartItem);
  return router;
}
