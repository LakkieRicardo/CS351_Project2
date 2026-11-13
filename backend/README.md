# Backend

The Express API listens on `PORT` (default `5000`) and requires `MONGODB_URI`.
For a single-host `mongodb://` URI without a port, optionally set
`MONGODB_PORT` to the database port; MongoDB's standard port is used when it
is omitted. Do not set `MONGODB_PORT` if the URI already includes a port or
uses `mongodb+srv://`.
See [backend data architecture](../docs/backend-data-architecture.md) for
collection fields and controller responsibilities, and
[backend input validation](../docs/backend-input-validation.md) for the checks
performed before client data is used.
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
| POST | `/api/orders` | Place an order using the signed-in user's saved name, contact, and shipping details |
| GET | `/api/orders` | List the signed-in user's orders |
| GET | `/api/orders/:id` | Get one of the signed-in user's orders |

Cart and order requests should include the Express session cookie. `POST /api/orders` accepts the checkout payment fields and uses the logged-in user's saved name, email, phone, and shipping address. The account must have a valid first and last name, phone number, and shipping address. Order documents receive sequential IDs starting at `ORD-1001`, store the order date, customer details, items, shipping address, and totals in the `orders` collection. Order totals use the cart's pricing rules: $10 shipping per item and 8% tax on the subtotal.