import { Component } from 'react';
import { API_BASE_URL } from '../api';

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatOrderDate = (date) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? 'Date unavailable' : parsedDate.toLocaleString();
};

export class OrderHistory extends Component {
  state = { orders: [], isLoading: true, error: '' };

  componentDidMount() {
    this.loadOrders();
  }

  loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load order history');
      this.setState({ orders: data.orders || [], isLoading: false, error: '' });
    } catch (error) {
      this.setState({ isLoading: false, error: error.message });
    }
  };

  render() {
    const { heading = 'Your order history' } = this.props;
    const { orders, isLoading, error } = this.state;

    return (
      <section className="mt-4" aria-label={heading}>
        <h3 className="h4">{heading}</h3>
        {isLoading && <p className="text-secondary">Loading your orders…</p>}
        {error && (
          <p className="text-danger" role="alert">
            Unable to load your order history: {error}
          </p>
        )}
        {!isLoading && !error && orders.length === 0 && (
          <p className="text-secondary">You have no previous orders.</p>
        )}
        {orders.map((order) => (
          <article key={order._id} className="card bg-dark text-white border-secondary mb-3">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between gap-2">
                <div>
                  <strong>{order._id}</strong>
                  <div className="text-secondary">{formatOrderDate(order.orderDate)}</div>
                </div>
                <strong>${formatCurrency(order.totals?.total)}</strong>
              </div>
              <ul className="mb-0 mt-3">
                {(order.items || []).map((item, index) => (
                  <li key={`${order._id}-${item.productId}-${index}`}>
                    {item.name} — {item.variant}, {item.size} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    );
  }
}

export default OrderHistory;
