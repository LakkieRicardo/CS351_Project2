import { Component } from 'react';
import ProductCard from './ProductCard';

class ProductList extends Component {
  render() {
    const { products, onSelectProduct, onAddToCart, isMainPage } = this.props;

    return (
      <div className="product-listing">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isMainPage={isMainPage}
            onClick={() => onSelectProduct(product)}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    );
  }
}

export default ProductList;
