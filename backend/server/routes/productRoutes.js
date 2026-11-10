import { Router } from 'express';

export function createProductRoutes(productController) {
  const router = Router();
  router.get('/', productController.getProducts);
  router.get('/:id', productController.getProductById);
  return router;
}
