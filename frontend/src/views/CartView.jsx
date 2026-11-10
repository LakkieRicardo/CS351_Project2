import { Component } from 'react';

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
            onClick={() => onDecrease(product.productId, product.variant, product.size)}
            aria-label={`Decrease quantity for ${product.name}`}
          >
            −
          </button>
          <span className="cart-qty-value">{product.quantity}</span>
          <button
            type="button"
            className="btn btn-outline-light btn-sm cart-qty-btn"
            disabled={!canIncrease}
            onClick={() => onIncrease(product.productId, product.variant, product.size)}
            aria-label={`Increase quantity for ${product.name}`}
          >
            +
          </button>
          <button
            type="button"
            className="btn btn-close btn-close-white cart-remove-btn"
            onClick={() => onRemove(product.productId, product.variant, product.size)}
            aria-label={`Remove ${product.name} from cart`}
          />
        </div>
      </div>
    );
  }
}

export class CartView extends Component {
  render() {
    const { products = [], showTitle = true, onIncrease, onDecrease, onRemove } = this.props;
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
        {showTitle && <h2>Cart</h2>}
        {products.length === 0 ? (
          <p className="text-secondary mb-0">Your cart is empty.</p>
        ) : (
          <div className="d-flex flex-column">
            {products.map((product) => (
              <div key={`${product.productId}-${product.variant}-${product.size}`}>
                <ProductPreview
                  product={product}
                  canIncrease={
                    (productQuantityById.get(product.productId) || 0) <
                    Number(product.quantityInStock ?? Infinity)
                  }
                  onIncrease={onIncrease}
                  onDecrease={onDecrease}
                  onRemove={onRemove}
                />
                <div className="text-end text-secondary mb-2">
                  Unit price: ${formatCurrency(product.salePrice)}
                </div>
                <div className="text-end text-secondary mb-2">
                  Line total: ${formatCurrency(Number(product.salePrice || 0) * Number(product.quantity || 0))}
                </div>
              </div>
            ))}

            <div className="border-top border-secondary pt-3 mt-2 text-white">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary mt-1">
                <span>Shipping</span>
                <span>${formatCurrency(shipping)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary mt-1">
                <span>Taxes</span>
                <span>${formatCurrency(taxes)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary mt-1">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>
              <div className="d-flex justify-content-between mt-3 fw-bold fs-5">
                <span>Total</span>
                <span>${formatCurrency(total)}</span>
              </div>
              <div className="text-secondary mt-2">Shipping + taxes included in total price.</div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CartView;
