import { Component } from 'react';

const variantStyles = {
  Regular: { color: '#f0f9ff', background: '#075985', accent: '#38bdf8', fontFamily: 'Georgia, serif', fontWeight: 700 },
  Enhanced: { color: '#f0fdf4', background: '#166534', accent: '#4ade80', fontFamily: 'Trebuchet MS, sans-serif', fontWeight: 700 },
  Corrupted: { color: '#fff1f2', background: '#9d174d', accent: '#fb7185', fontFamily: 'Verdana, sans-serif', fontWeight: 700 },
};

const renderWithBreaks = (text = '') =>
  text.split('\n').map((line, index, lines) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));

class ProductCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVariant: '',
      selectedSize: '',
    };
  }

  render() {
    const { product, onClick, onAddToCart, isMainPage } = this.props;
    const variants = product.variants || [];
    const sizes = product.sizes || ['Small', 'Medium', 'Large'];
    const { selectedVariant, selectedSize } = this.state;
    const canAddToCart = Boolean(selectedVariant && selectedSize && onAddToCart);
    const isLowStock = Number(product.quantityInStock) < 5;
    const hasTestimony = product.testimonyIcon || product.testimonyQuote || product.testimonySource;

    const handleCardClick = (event) => {
      if (!onClick) {
        return;
      }

      const target = event.target;
      const interactiveSelector = 'button, input, textarea, select, a, label';

      if (target instanceof HTMLElement && target.closest(interactiveSelector)) {
        return;
      }

      onClick();
    };

    return (
      <div
        className={`product-listing-item ${isMainPage ? 'product-card-clickable' : ''}`}
        data-main-page={isMainPage ? 'true' : 'false'}
        onClick={isMainPage ? handleCardClick : undefined}
        onKeyDown={(event) => {
          if (isMainPage && onClick && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            event.stopPropagation();
            onClick();
          }
        }}
        role={isMainPage ? 'button' : undefined}
        tabIndex={isMainPage ? 0 : undefined}
        aria-label={isMainPage ? `View ${product.name}` : undefined}
      >
        <div
          className={`product-listing-item-img ${isMainPage ? 'product-image-button' : ''}`}
          onClick={isMainPage ? onClick : undefined}
          onKeyDown={(event) => {
            if (isMainPage && (event.key === 'Enter' || event.key === ' ') && onClick) {
              event.preventDefault();
              onClick();
            }
          }}
          role={isMainPage ? 'button' : undefined}
          tabIndex={isMainPage ? 0 : undefined}
          aria-label={isMainPage ? `View ${product.name}` : undefined}
        >
          <img width={256} src={`${import.meta.env.BASE_URL}product-images/${product.image}`} alt={product.name} />
          {(product.popular === true || product.salePrice <= product.price * 0.7 || isLowStock) && (
            <div className="product-ribbon-stack">
              {product.popular === true && <span className="popular-ribbon">POPULAR!</span>}
              {product.salePrice <= product.price * 0.7 && (
                <span className="sale-ribbon">
                  {product.salePrice < product.price * 0.5 ? 'MAJOR SALE!!' : 'SALE!'}
                </span>
              )}
              {isLowStock && <span className="stock-ribbon">{product.quantityInStock} left in stock!</span>}
            </div>
          )}
        </div>
        <h4>{product.name}</h4>
        <p>
          <s className="sale-font">${product.price}</s> ${product.salePrice}
        </p>
        <p className="product-rating mb-1">
          <span className="product-rating-value" aria-label={`${product.rating} out of 5 stars`}>
            ★ {Number(product.rating).toFixed(1)}
          </span>
          <span className="product-review-count"> ({Number(product.reviewCount).toLocaleString('en-US')} reviews)</span>
        </p>
        <p className="text-secondary">In stock: {product.quantityInStock}</p>

        <div className="product-size-list">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              className={`product-size-box ${selectedSize === size ? 'selected' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                this.setState({ selectedSize: size });
              }}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="product-variant-list">
          {variants.map((variant) => {
            const style = variantStyles[variant] || {
              color: '#f8fafc',
              background: '#1f2937',
              fontFamily: 'sans-serif',
              fontWeight: 600,
            };

            return (
              <button
                key={variant}
                type="button"
                className={`product-variant-box ${selectedVariant === variant ? 'selected' : ''}`}
                style={{
                  '--variant-color': style.color,
                  '--variant-background': style.background,
                  '--variant-accent': style.accent || style.color,
                  fontFamily: style.fontFamily,
                  fontWeight: style.fontWeight,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  this.setState({ selectedVariant: variant });
                }}
              >
                {variant}
              </button>
            );
          })}
        </div>

        {isMainPage ? (
          <p className="description-text">{renderWithBreaks(product.shortDescription)}</p>
        ) : (
          <div>
            <p className="description-text">{renderWithBreaks(product.shortDescription)}</p>
            <p className="description-text">{renderWithBreaks(product.description)}</p>
            {hasTestimony && (
              <div className="product-testimony">
                {product.testimonyIcon && (
                  <img
                    className="product-testimony-icon"
                    src={`${import.meta.env.BASE_URL}product-images/${product.testimonyIcon}`}
                    alt=""
                  />
                )}
                <div>
                  {product.testimonyQuote && (
                    <blockquote className="product-testimony-quote">
                      &ldquo;{product.testimonyQuote}&rdquo;
                    </blockquote>
                  )}
                  {product.testimonySource && (
                    <p className="product-testimony-source">- {product.testimonySource}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="btn btn-light w-100 mt-auto"
          disabled={!canAddToCart}
          onClick={(event) => {
            event.stopPropagation();
            if (canAddToCart) {
              onAddToCart(product, selectedVariant, selectedSize);
            }
          }}
        >
          Add to cart
        </button>
        <hr />
      </div>
    );
  }
}

export default ProductCard;
