import { Component } from 'react';
import ProductList from '../components/ProductList';

export class ShopView extends Component {
  render() {
    const { products, onSelectProduct, onAddToCart, isMainPage } = this.props;
    const prioritizedProducts = products
      .map((product, index) => {
        const isMajorSale = product.salePrice < product.price * 0.5;
        const isSale = product.salePrice <= product.price * 0.7;
        const priority =
          Number(product.popular === true) +
          Number(Number(product.quantityInStock) < 5) +
          (isMajorSale ? 2 : isSale ? 1 : 0);

        return { product, index, priority };
      })
      .sort((first, second) => second.priority - first.priority || first.index - second.index)
      .map(({ product }) => product);

    return (
      <div className="shop-view-content">
        <img
          src={`${import.meta.env.BASE_URL}shop-header.png`}
          alt="Hot fresh items"
          className="shop-header"
        />
        <hr className="border-secondary" />
        <ProductList
          products={prioritizedProducts}
          onSelectProduct={onSelectProduct}
          onAddToCart={onAddToCart}
          isMainPage={isMainPage}
        />
      </div>
    );
  }
}

export default ShopView;
