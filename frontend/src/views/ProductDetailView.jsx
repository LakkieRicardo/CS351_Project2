import { Component } from 'react';
import ProductCard from '../components/ProductCard';

export class ProductDetailView extends Component {
  render() {
    const { product, onGoBack, onAddToCart } = this.props;

    return (
      <div className="container py-3">
        <button
          type="button"
          className="btn btn-link text-white p-0 fs-5 text-decoration-none"
          onClick={onGoBack}
        >
          ← Go back
        </button>
        <hr className="border-secondary" />
        <ProductCard product={product} isMainPage={false} onAddToCart={onAddToCart} />
      </div>
    );
  }
}

export default ProductDetailView;
