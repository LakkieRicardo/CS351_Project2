import './App.css'

import { Component } from 'react';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { AccountView } from './views/AccountView';
import { CreateAccountView } from './views/CreateAccountView';
import { CartView } from './views/CartView';
import { OrderConfirmationView } from './views/OrderConfirmationView';
import { API_BASE_URL } from './api';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      currentProduct: null,
      currentPage: 'Home',
      isMainPage: true,
      cart: [],
      cartError: '',
      isPlacingOrder: false,
      lastOrder: null,
    };
  }

  componentDidMount() {
    // Project 2 requirement: load products through Express from MongoDB.
    fetch(`${API_BASE_URL}/api/products`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ products: data });
      })
      .catch((error) => {
        console.error('Failed to load products:', error);
      });
    this.loadCart();
  }

  loadCart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart`, { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load cart');
      this.setState({ cart: this.normalizeCart(data.cart || []), cartError: '' });
    } catch (error) {
      console.error('Failed to load cart:', error);
      this.setState({ cartError: error.message });
    }
  };

  updateServerCart = async (url, options) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to update cart');
      this.setState({ cart: this.normalizeCart(data.cart || []), cartError: '' });
    } catch (error) {
      this.setState({ cartError: error.message });
    }
  };

  normalizeCart = (cart = []) => {
    const byKey = new Map();

    for (const item of cart) {
      const key = `${item.productId}::${item.variant}::${item.size}`;

      if (!byKey.has(key)) {
        byKey.set(key, { ...item, quantity: Number(item.quantity || 0) });
        continue;
      }

      const existingItem = byKey.get(key);
      existingItem.quantity += Number(item.quantity || 0);
    }

    return Array.from(byKey.values()).filter((item) => Number(item.quantity || 0) > 0);
  };

  changePage = (page) => {
    this.setState({
      currentPage: page,
      currentProduct: null,
      isMainPage: page === 'Home' || page === 'Shop' || page === 'Account' || page === 'Cart',
    });
  };

  openProduct = (product) => {
    this.setState({
      currentProduct: product,
      currentPage: 'Shop',
      isMainPage: false,
    });
  };

  addToCart = (product, variant, size) => {
    if (!variant || !size) {
      return Promise.resolve(false);
    }

    return (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, variant, size }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to add item to cart');

        this.setState({
          cart: this.normalizeCart(data.cart || []),
          cartError: '',
          currentPage: 'Cart',
          currentProduct: null,
          isMainPage: true,
        });
        return true;
      } catch (error) {
        this.setState({
          cartError: error.message,
          currentPage: 'Cart',
          currentProduct: null,
          isMainPage: true,
        });
        return false;
      }
    })();
  };

  changeCartItemQuantity = (item, delta) => {
    const quantity = Number(item.quantity) + delta;
    if (quantity < 1) {
      return this.removeCartItem(item);
    }
    return this.updateServerCart(`/api/cart/${encodeURIComponent(item.itemId)}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  };

  removeCartItem = (item) => {
    return this.updateServerCart(`/api/cart/${encodeURIComponent(item.itemId)}`, {
      method: 'DELETE',
    });
  };

  placeOrder = async ({ firstName, lastName }) => {
    this.setState({ isPlacingOrder: true, cartError: '' });
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to place order');
      this.setState({
        cart: [],
        lastOrder: data.order,
        currentPage: 'Order Confirmation',
        isMainPage: false,
        isPlacingOrder: false,
      });
    } catch (error) {
      this.setState({ cartError: error.message, isPlacingOrder: false });
    }
  };

  renderNavigation() {
    const { currentPage, cart } = this.state;
    const navItems = ['Home', 'Shop', 'Account'];
    const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const activeAccent = currentPage === 'Cart' ? 'cart-page' : `${currentPage.toLowerCase()}-page`;

    return (
      <aside className={`app-sidebar ${activeAccent}`}>
        <div className="nav-brand-mark">
          <button
            type="button"
            className="btn p-0 border-0 bg-transparent"
            onClick={() => {
              this.setState({
                currentProduct: null,
                currentPage: 'Home',
                isMainPage: true,
              });
            }}
            aria-label="Go to home page"
          >
            <img src={`${import.meta.env.BASE_URL}deadlock-logo.png`} alt="Deadlock logo" className="nav-icon" />
          </button>
        </div>
        <hr className="border-secondary" />
        <nav className="navbar-nav app-navigation" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              type="button"
              key={item}
              className={`btn btn-sm app-navigation-button ${
                currentPage === item ? `${item.toLowerCase()}-page-highlight` : ''
              } ${
                currentPage === item ? 'btn-light' : 'btn-outline-light'
              }`}
              onClick={() => this.changePage(item)}
              aria-label={item}
            >
              <img
                src={`${import.meta.env.BASE_URL}${
                  item === 'Home' ? 'spirit.png' : item === 'Shop' ? 'gun.png' : 'movement.png'
                }`}
                alt=""
                className="app-navigation-icon"
              />
            </button>
          ))}
        </nav>
        <hr className="border-secondary" />
        <div className="sidebar-cart">
          <button
            type="button"
            className={`btn btn-sm app-navigation-button cart-toggle ${
              currentPage === 'Cart' ? 'cart-page-highlight btn-light' : 'btn-outline-light'
            }`}
            onClick={() => this.changePage('Cart')}
            aria-label="Cart"
          >
            <img
              src={`${import.meta.env.BASE_URL}survival.png`}
              alt=""
              className="app-navigation-icon"
            />
            {totalItemCount > 0 && <span className="cart-count-badge">({totalItemCount})</span>}
          </button>
        </div>
      </aside>
    );
  }

  render() {
    const { products, currentProduct, currentPage, isMainPage, cart } = this.state;

    if (currentProduct != null) {
      return (
        <div className="bg-dark text-white min-vh-100">
          <div className="app-content-layout">
            {this.renderNavigation()}
            <main className="app-main-content">
              <ProductDetailView
                product={currentProduct}
                onGoBack={() => {
                  this.setState({
                    currentProduct: null,
                    currentPage: 'Shop',
                    isMainPage: true,
                  });
                }}
                onAddToCart={this.addToCart}
              />
            </main>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-dark text-white min-vh-100">
        <div className="app-content-layout">
          {this.renderNavigation()}
          <main
            className={`app-main-content ${
              currentPage === 'Shop' ? 'shop-view-background' : currentPage === 'Home' ? 'home-view-background' : ''
            }`}
          >
            <div className="container py-3">
              {currentPage === 'Home' ? (
                <HomeView />
              ) : currentPage === 'Shop' ? (
                <ShopView
                  products={products}
                  onSelectProduct={this.openProduct}
                  onAddToCart={this.addToCart}
                  isMainPage={isMainPage}
                />
              ) : currentPage === 'Account' ? (
                <AccountView
                  onGoToCreateAccount={() => this.setState({ currentPage: 'Create Account', isMainPage: false })}
                />
              ) : currentPage === 'Cart' ? (
                <CartView
                  products={cart}
                  onIncrease={(item) => this.changeCartItemQuantity(item, 1)}
                  onDecrease={(item) => this.changeCartItemQuantity(item, -1)}
                  onRemove={this.removeCartItem}
                  onPlaceOrder={this.placeOrder}
                  isPlacingOrder={this.state.isPlacingOrder}
                  error={this.state.cartError}
                />
              ) : currentPage === 'Order Confirmation' ? (
                <OrderConfirmationView
                  order={this.state.lastOrder}
                  onContinueShopping={() => this.changePage('Shop')}
                />
              ) : (
                <CreateAccountView />
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default App;
