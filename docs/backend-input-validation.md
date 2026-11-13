# Backend input validation

Request bodies are parsed by `express.json()` in `backend/server/server.js`.
Input checks are implemented in the route's controller; there is no shared
validation middleware. Invalid input is returned as a JSON `error` response
before the corresponding write or session update.

## Account controller

`validateAccountInput` in `backend/server/controllers/accountController.js`
is used by both account creation and profile updates:

| Field | Check |
|---|---|
| `firstName`, `lastName`, `city` | After trimming, 2–50 ASCII letters, spaces, `.`, `'`, or `-`. |
| `username` | 3–20 ASCII letters, digits, or underscores. |
| `email` | Matches the controller's non-whitespace `local@domain.tld` pattern. |
| `password` | Required on creation; at least 8 characters. Not required on profile update. |
| `phone` | Matches the controller's US phone pattern, with optional country code `1` and supported separators. |
| `street` | At least 3 characters after trimming. |
| `state` | Exactly two letters after trimming. Stored uppercase. |
| `zip` | Five digits, optionally followed by `-` and four digits. |

Creation checks for an existing username and normalized lowercase email before
inserting a user. A passing password is stored as a bcrypt hash. Profile
updates run the same checks without requiring a password, check for username
or email duplicates excluding the current user, then update the profile
fields.

Login requires a username-or-email and password. It looks up the username or
lowercase email and compares the password with the stored bcrypt hash. A
successful login stores the user ID in the session.

## Product controller

`GET /api/products/:id` converts the path parameter to a number and requires an
integer before querying `products.id`. Invalid IDs return `400`; a missing
product returns `404`. `GET /api/products` returns the collection without
accepting client-supplied data.

## Cart controller

`POST /api/cart` checks that `productId` converts to an integer and that
`variant` and `size` are present. It then loads the product and checks the
requested variant and size against the product document. If `sizes` is absent,
the allowed sizes are `Small`, `Medium`, and `Large`.

The optional `quantity` defaults to `1`; its numeric value must be a positive
integer. The controller checks the requested quantity plus quantities already
in the session cart against the product's finite `quantityInStock`. Invalid
input returns `400`; missing products return `404`; unavailable options or
stock conflicts return `400` or `409`, respectively.

`PUT /api/cart/:itemId` applies the same positive-integer quantity check,
requires that the item exists in the current session, reloads its product, and
checks the new quantity against stock and other cart entries for that product.
`DELETE /api/cart/:itemId` only removes an item found in the current session.

Names, images, prices, and stock values written to cart items are read from
MongoDB. The client does not supply those values.

## Order controller

`POST /api/orders` performs these checks before inserting an order:

- The session has a valid MongoDB user ID, and the user exists.
- The signed-in user's saved `firstName` and `lastName` are nonempty after
  trimming and no longer than 50 characters.
- `cardType` is present; the card number contains 12–19 digits after
  non-digits are removed; the CVV contains 3 or 4 digits.
- The session cart is not empty.
- The user's profile has an email, a phone number with at least 10 digits, a
  nonempty street and city, a two-letter state, and a valid 5-digit or
  ZIP+4 ZIP code.
- Every cart product still exists, aggregate quantities do not exceed finite
  stock, and each variant and size is still available.
- The unit price recalculated from the product's `salePrice` is finite and
  nonnegative.

Order item names, images, IDs, options, unit prices, and line totals are
constructed or recalculated from the session cart and current product
documents. Totals are calculated by the controller. Only `cardType` and the
last four card digits are stored; the card number and CVV are not inserted.
`cardType` is checked for presence but is not restricted to an allowed-value
list.

`GET /api/orders` requires a valid session user ID and queries only that user's
orders. `GET /api/orders/:id` also requires the path ID to match `ORD-<digits>`
and queries by both order ID and session user ID.

## Responses for rejected requests

- `400`: invalid field, option, quantity, or order ID; empty cart or incomplete
  checkout profile.
- `401`: invalid login credentials or missing or invalid login session.
- `404`: requested account, product, cart item, or order does not exist.
- `409`: duplicate account identity, stock conflict, or a cart product or
  option that is no longer available.
