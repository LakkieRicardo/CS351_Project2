# Backend

The Express API runs on port `5000` by default and requires `MONGODB_URI`.
When packaged by the root `deploy.ps1` script, the server also serves the
frontend from the sibling `static/` directory, including the SPA entry point
for non-API routes. API routes remain under `/api`.

## API routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get a product |
| POST | `/api/accounts` | Create an account |
| POST | `/api/login` | Start a login session |
| POST | `/api/logout` | End the login session |
| GET | `/api/account` | Get the signed-in account |
| PUT | `/api/account` | Update the signed-in account |
| GET | `/api/cart` | Get the session cart |
| POST | `/api/cart` | Add a product selection; JSON: `{ "productId": 1, "variant": "Regular", "size": "Medium" }` |
| PUT | `/api/cart/:itemId` | Set an item's quantity; JSON: `{ "quantity": 2 }` |
| DELETE | `/api/cart/:itemId` | Remove a cart item |
| POST | `/api/orders` | Place an order using checkout first/last name and the signed-in user's saved contact and shipping details |
| GET | `/api/orders` | List the signed-in user's orders |
| GET | `/api/orders/:id` | Get one of the signed-in user's orders |

Cart and order requests should include the Express session cookie. `POST /api/orders` accepts JSON `{ "firstName": "Ben", "lastName": "Shah" }` and also requires a logged-in user with email, phone, street, city, two-letter state, and ZIP code saved on their account. Order documents receive sequential IDs starting at `ORD-1001`, store the order date, customer details, items, shipping address, and totals in the `orders` collection. Order totals use the cart's pricing rules: $10 shipping per item and 8% tax on the subtotal.