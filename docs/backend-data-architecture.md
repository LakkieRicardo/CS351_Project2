# Backend controllers and database

## Database

The server connects to the `CS351Project2` MongoDB database. It uses four
collections: `products`, `users`, `orders`, and `counters`.

### `products`

Products are looked up by their numeric `id`. The backend reads these fields:

- `id`
- `name`
- `image`
- `price`
- `salePrice`
- `quantityInStock`
- `variants`
- `sizes` (defaults to `Small`, `Medium`, and `Large` if absent)

The frontend catalog data in `frontend/client/public/products.json` also
contains `rating`, `reviewCount`, `shortDescription`, `description`, and
`popular`. Some catalog entries contain `testimonyIcon`, `testimonyQuote`, and
`testimonySource`.

The cart and order controllers check product options and stock using
`variants`, `sizes`, and `quantityInStock`. Cart and order prices are computed
from `salePrice`.

### `users`

Account creation inserts these fields:

```text
username
email
passwordHash
firstName
lastName
phone
shippingAddress
  street
  city
  state
  zip
createdAt
```

`email` is stored lowercase, `state` uppercase, and `passwordHash` is created
with bcrypt. Account updates change the username, email, name, phone, and
shipping address; they do not update the password or `createdAt`. Account API
responses omit `passwordHash`.

### `orders`

Orders are inserted with this shape:

```text
_id                 "ORD-<sequence>"
userId              user's MongoDB _id as a string
orderDate
customer
  firstName
  lastName
  email
  phone
shippingAddress     copy of the user's shippingAddress
payment
  cardType
  last4
items[]             productId, name, image, variant, size,
                    unitPrice, quantity, lineTotal
totals
  subtotal
  shipping
  taxes
  total
  itemCount
status              "Submitted"
```

The customer name, email, and phone are copied from the signed-in user's
profile.

Only the card type and final four card digits are stored in an order. Shipping
is calculated at `$10` per item and tax at `8%` of the subtotal.

### `counters`

The order controller uses one counter document:

```text
_id       "order-counter"
sequence  starts at 1000 and increments for each order
```

The incremented value produces order IDs beginning with `ORD-1001`.

## Session cart

Cart data is stored in `request.session.cart`, not in a MongoDB collection.
Each cart item has:

```text
itemId
productId
name
image
variant
size
salePrice
quantityInStock
quantity
```

`itemId` is a UUID. The session also stores `userId` after login. The server
does not configure a MongoDB session store.

## Controllers and routes

| Controller | Routes | Database/session work |
|---|---|---|
| Account | `POST /api/accounts`, `POST /api/login`, `POST /api/logout`, `GET /api/account`, `PUT /api/account` | Creates and updates users; stores the logged-in user ID in the session. |
| Product | `GET /api/products`, `GET /api/products/:id` | Reads product documents. |
| Cart | `GET /api/cart`, `POST /api/cart`, `PUT /api/cart/:itemId`, `DELETE /api/cart/:itemId` | Stores cart items in the session and checks product options and stock against `products`. |
| Order | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id` | Creates orders from the session cart and user profile; reads orders belonging to the logged-in user; increments the order counter. |
