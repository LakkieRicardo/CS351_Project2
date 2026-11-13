import { Component } from 'react';
import { OrderHistory } from '../components/OrderHistory';

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatOrderDate = (date) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? 'Date unavailable' : parsedDate.toLocaleString();
};

export class OrderConfirmationView extends Component {
  render() {
    const { order, onContinueShopping } = this.props;
    const customer = order?.customer || {};
    const shippingAddress = order?.shippingAddress || {};
    const items = order?.items || [];
    const totals = order?.totals || {};

    return (
      <div className="container py-3">
        <h2>Order Confirmation</h2>
        {order ? (
          <div className="card bg-dark text-white border-secondary">
            <div className="card-body p-4">
              <p className="text-success fw-semibold mb-2">Order placed successfully</p>
              <h3 className="h4 mb-1">Thank you, {customer.firstName}!</h3>
              <p className="text-secondary">Your order confirmation is below.</p>

              <div className="row g-3 border-top border-secondary pt-3">
                <div className="col-sm-6">
                  <div className="text-secondary">Order number</div>
                  <strong>{order._id}</strong>
                </div>
                <div className="col-sm-6">
                  <div className="text-secondary">Order date</div>
                  <strong>{formatOrderDate(order.orderDate)}</strong>
                </div>
              </div>

              <h3 className="h5 mt-4">Items</h3>
              {items.map((item, index) => (
                <div
                  className="d-flex align-items-center justify-content-between gap-3 border-top border-secondary py-3"
                  key={`${item.productId}-${item.variant}-${item.size}-${index}`}
                >
                  <div className="d-flex align-items-center gap-3">
                    {item.image && (
                      <img
                        width={48}
                        height={48}
                        className="rounded object-fit-cover"
                        src={`${import.meta.env.BASE_URL}product-images/${item.image}`}
                        alt=""
                      />
                    )}
                    <div>
                      <div className="fw-semibold">{item.name}</div>
                      <div className="text-secondary">
                        {item.variant} · {item.size} · Qty {item.quantity}
                      </div>
                    </div>
                  </div>
                  <strong>${formatCurrency(item.lineTotal)}</strong>
                </div>
              ))}

              <div className="row g-4 border-top border-secondary pt-3 mt-2">
                <section className="col-md-6" aria-label="Customer details">
                  <h3 className="h5">Customer</h3>
                  <div>{customer.firstName} {customer.lastName}</div>
                  <div>{customer.email}</div>
                  <div>{customer.phone}</div>
                </section>
                <section className="col-md-6" aria-label="Shipping address">
                  <h3 className="h5">Shipping address</h3>
                  <div>{shippingAddress.street}</div>
                  <div>
                    {[shippingAddress.city, shippingAddress.state, shippingAddress.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </section>
              </div>

              <div className="border-top border-secondary pt-3 mt-4 ms-auto" style={{ maxWidth: '24rem' }}>
                <div className="d-flex justify-content-between">
                  <span>Subtotal</span><span>${formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between text-secondary mt-1">
                  <span>Shipping</span><span>${formatCurrency(totals.shipping)}</span>
                </div>
                <div className="d-flex justify-content-between text-secondary mt-1">
                  <span>Taxes</span><span>${formatCurrency(totals.taxes)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 mt-3">
                  <span>Total</span><span>${formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : <p className="text-secondary">No recent order is available to display.</p>}

        <OrderHistory />

        <button type="button" className="btn btn-light mt-3" onClick={onContinueShopping}>
          Continue Shopping
        </button>
      </div>
    );
  }
}

export default OrderConfirmationView;
