import { Router } from 'express';

export function createAccountRoutes(accountController) {
  const router = Router();
  router.post('/accounts', accountController.createAccount);
  router.post('/login', accountController.login);
  router.post('/logout', accountController.logout);
  router.get('/account', accountController.getAccount);
  router.put('/account', accountController.updateAccount);
  return router;
}
