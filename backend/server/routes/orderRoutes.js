import { Router } from 'express';

export function createOrderRoutes(orderController) {
  const router = Router();
  router.post('/', orderController.createOrder);
  router.get('/', orderController.getOrders);
  router.get('/:id', orderController.getOrderById);
  return router;
}
