import { Component } from 'react';
import { OrderHistory } from '../components/OrderHistory';
import CurrencyAmount from '../components/CurrencyAmount';

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

class ProductPreview extends Component {
  render() {
    const { product, onIncrease, onDecrease, onRemove, canIncrease } = this.props;

    return (
      <div className="d-flex align-items-center justify-content-between border border-secondary rounded p-2 mb-2 text-white cart-item-row">
        <div className="d-flex align-items-center gap-3">
          <img
            width={32}
            src={`${import.meta.env.BASE_URL}product-images/${product.image}`}
            alt={product.name}
            className="rounded"
          />
          <div>
            <div>{product.name}</div>
            <div className="text-secondary">{product.variant} - {product.size}</div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-light btn-sm cart-qty-btn"
            onClick={onDecrease}
            aria-label={`Decrease quantity for ${product.name}`}
          >
            −
          </button>
          <span className="cart-qty-value">{product.quantity}</span>
          <button
            type="button"
            className="btn btn-outline-light btn-sm cart-qty-btn"
            disabled={!canIncrease}
            onClick={onIncrease}
            aria-label={`Increase quantity for ${product.name}`}
          >
            +
          </button>
          <button
            type="button"
            className="btn btn-close btn-close-white cart-remove-btn"
            onClick={onRemove}
            aria-label={`Remove ${product.name} from cart`}
          />
        </div>
      </div>
    );
  }
}

export class CartView extends Component {
  handlePlaceOrder = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    this.props.onPlaceOrder({
      cardType: formData.get('cardType'),
      cardNumber: formData.get('cardNumber'),
      cvv: formData.get('cvv'),
    });
  };

  render() {
    const {
      products = [],
      showTitle = true,
      onIncrease,
      onDecrease,
      onRemove,
      onPlaceOrder,
      isPlacingOrder = false,
      error = '',
    } = this.props;
    const subtotal = products.reduce(
      (sum, product) => sum + Number(product.salePrice || 0) * Number(product.quantity || 0),
      0,
    );
    const itemCount = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
    const productQuantityById = products.reduce((quantities, product) => {
      quantities.set(
        product.productId,
        (quantities.get(product.productId) || 0) + Number(product.quantity || 0),
      );
      return quantities;
    }, new Map());
    const shipping = itemCount * 10;
    const taxes = subtotal * 0.08;
    const total = subtotal + shipping + taxes;

    return (
      <div className="container py-3">
        {showTitle && (
          <h2 className="cart-view-title">
          Cart
          <img src={`${import.meta.env.BASE_URL}soul-urn.png`} alt="" className="cart-title-icon" />
          </h2>
        )}
        {error && <p className="text-danger" role="alert">{error}</p>}
        {products.length === 0 ? (
          <p className="text-secondary mb-0">Your cart is empty.</p>
        ) : (
          <div className="d-flex flex-column">
            {products.map((product) => (
              <div key={product.itemId || `${product.productId}-${product.variant}-${product.size}`}>
                <ProductPreview
                  product={product}
                  canIncrease={
                    (productQuantityById.get(product.productId) || 0) <
                    Number(product.quantityInStock ?? Infinity)
                  }
                  onIncrease={() => onIncrease(product)}
                  onDecrease={() => onDecrease(product)}
                  onRemove={() => onRemove(product)}
                />
                <div className="text-end text-secondary mb-2">
                  Unit price: <CurrencyAmount value={formatCurrency(product.salePrice)} />
                </div>
                <div className="text-end text-secondary mb-2">
                  Line total:{' '}
                  <CurrencyAmount value={formatCurrency(Number(product.salePrice || 0) * Number(product.quantity || 0))} />
                </div>
              </div>
            ))}

            <div className="border-top border-secondary pt-3 mt-2 text-white">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <CurrencyAmount value={formatCurrency(subtotal)} />
              </div>
              <div className="d-flex justify-content-between text-secondary mt-1">
                <span>Shipping</span>
                <CurrencyAmount value={formatCurrency(shipping)} />
              </div>
              <div className="d-flex justify-content-between text-secondary mt-1">
                <span>Taxes</span>
                <CurrencyAmount value={formatCurrency(taxes)} />
              </div>
              <div className="d-flex justify-content-between text-secondary mt-1">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>
              <div className="d-flex justify-content-between mt-3 fw-bold fs-5">
                <span>Total</span>
                <CurrencyAmount value={formatCurrency(total)} />
              </div>
              <div className="text-secondary mt-2">Shipping + taxes included in total price.</div>
              {onPlaceOrder && (
                <form className="mt-3" onSubmit={this.handlePlaceOrder}>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="checkout-card-type">Card type</label>
                      <input
                        id="checkout-card-type"
                        className="form-control"
                        name="cardType"
                        placeholder="Visa, Mastercard, etc."
                        required
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="checkout-card-number">Card number</label>
                      <input
                        id="checkout-card-number"
                        className="form-control"
                        name="cardNumber"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        pattern="[0-9 ]{12,23}"
                        maxLength={23}
                        required
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label" htmlFor="checkout-cvv">CVV</label>
                      <input
                        id="checkout-cvv"
                        className="form-control"
                        name="cvv"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        pattern="[0-9]{3,4}"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-light w-100 mt-auto place-order-button"
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'Placing order…' : 'Place Order'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
        <OrderHistory heading="Previous orders" />
      </div>
    );
  }
}

export default CartView;
