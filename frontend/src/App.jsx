import './App.css'

import { Component } from 'react';
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { AccountView } from './views/AccountView';
import { CreateAccountView } from './views/CreateAccountView';
import { CartView } from './views/CartView';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      currentProduct: null,
      currentPage: 'Home',
      isMainPage: true,
      isCartOpen: false,
      cart: [],
    };
  }

  componentDidMount() {
    fetch(`${import.meta.env.BASE_URL}products.json`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ users: data });
      })
      .catch((error) => {
        console.error('Failed to load products:', error);
      });
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.isCartOpen !== this.state.isCartOpen) {
      this.setPageScrollLock(this.state.isCartOpen);
    }
  }

  componentWillUnmount() {
    this.setPageScrollLock(false);
  }

  setPageScrollLock = (isLocked) => {
    const shouldLock = isLocked && window.matchMedia('(max-width: 600px)').matches;

    if (shouldLock && this.pageScrollY === undefined) {
      this.pageScrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.pageScrollY}px`;
      document.body.style.width = '100%';
      return;
    }

    if (!shouldLock && this.pageScrollY !== undefined) {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, this.pageScrollY);
      this.pageScrollY = undefined;
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
      return;
    }

    const sizeMultiplier = size === 'Small' ? 0.5 : size === 'Large' ? 2 : 1;
    const variantMultiplier = variant === 'Enhanced' ? 2 : 1;
    const unitPrice = Number(product.salePrice) * sizeMultiplier * variantMultiplier;

    this.setState((previousState) => {
      const normalizedCart = this.normalizeCart(previousState.cart);
      const stockLimit = Number(product.quantityInStock ?? Infinity);
      const currentProductQuantity = normalizedCart
        .filter((item) => item.productId === product.id)
        .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

      if (currentProductQuantity >= stockLimit) {
        return null;
      }

      const existingItem = normalizedCart.find(
        (item) => item.productId === product.id && item.variant === variant && item.size === size,
      );

      const nextCart = existingItem
        ? normalizedCart.map((item) =>
            item.productId === product.id && item.variant === variant && item.size === size
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [
            ...normalizedCart,
            {
              productId: product.id,
              name: product.name,
              image: product.image,
              variant,
              size,
              salePrice: unitPrice,
              quantityInStock: stockLimit,
              quantity: 1,
            },
          ];

      return {
        cart: nextCart,
        isCartOpen: true,
      };
    });
  };

  changeCartItemQuantity = (productId, variant, size, delta) => {
    this.setState((previousState) => {
      const normalizedCart = this.normalizeCart(previousState.cart);
      const matchingItem = normalizedCart.find(
        (item) => item.productId === productId && item.variant === variant && item.size === size,
      );
      const stockLimit = Number(matchingItem?.quantityInStock ?? Infinity);
      const currentProductQuantity = normalizedCart
        .filter((item) => item.productId === productId)
        .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

      if (delta > 0 && currentProductQuantity + delta > stockLimit) {
        return null;
      }

      return {
        cart: normalizedCart
          .map((item) =>
            item.productId === productId && item.variant === variant && item.size === size
              ? { ...item, quantity: item.quantity + delta }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    });
  };

  removeCartItem = (productId, variant, size) => {
    this.setState((previousState) => {
      const normalizedCart = this.normalizeCart(previousState.cart);

      return {
        cart: normalizedCart.filter(
          (item) => !(item.productId === productId && item.variant === variant && item.size === size),
        ),
      };
    });
  };

  renderNavigation() {
    const { currentPage, isCartOpen, cart } = this.state;
    const navItems = ['Home', 'Shop', 'Account'];
    const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const activeAccent = isCartOpen || currentPage === 'Cart' ? 'cart-page' : `${currentPage.toLowerCase()}-page`;

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
              isCartOpen || currentPage === 'Cart' ? 'cart-page-highlight btn-light' : 'btn-outline-light'
            }`}
            onClick={() => this.setState((previousState) => ({ isCartOpen: !previousState.isCartOpen }))}
            aria-label="Toggle cart"
          >
            <img
              src={`${import.meta.env.BASE_URL}survival.png`}
              alt=""
              className="app-navigation-icon"
            />
            {totalItemCount > 0 && <span className="cart-count-badge">({totalItemCount})</span>}
          </button>

          {isCartOpen && (
            <div className="cart-panel">
              <div className="card bg-dark border-secondary text-white shadow-lg">
                <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">Cart</span>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close cart"
                    onClick={() => this.setState({ isCartOpen: false })}
                  />
                </div>
                <div className="card-body p-3">
                  <CartView
                    products={cart}
                    showTitle={false}
                    onIncrease={(productId, variant, size) => this.changeCartItemQuantity(productId, variant, size, 1)}
                    onDecrease={(productId, variant, size) => this.changeCartItemQuantity(productId, variant, size, -1)}
                    onRemove={this.removeCartItem}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  render() {
    const { users, currentProduct, currentPage, isMainPage, cart } = this.state;

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
          <main className={`app-main-content ${currentPage === 'Shop' ? 'shop-view-background' : ''}`}>
            <div className="container py-3">
              <hr className="border-secondary" />
              {currentPage === 'Home' ? (
                <HomeView />
              ) : currentPage === 'Shop' ? (
                <ShopView
                  products={users}
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
                  onIncrease={(productId, variant, size) => this.changeCartItemQuantity(productId, variant, size, 1)}
                  onDecrease={(productId, variant, size) => this.changeCartItemQuantity(productId, variant, size, -1)}
                  onRemove={this.removeCartItem}
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