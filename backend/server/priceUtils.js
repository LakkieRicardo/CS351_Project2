export function normalizePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) ? Math.round(price) : 0;
}

export function normalizeProductPrices(product) {
  return {
    ...product,
    price: normalizePrice(product.price),
    salePrice: normalizePrice(product.salePrice),
  };
}

export function getUnitPrice(product, size, variant) {
  const sizeMultiplier = size === 'Small' ? 0.5 : size === 'Large' ? 2 : 1;
  const variantMultiplier = variant === 'Enhanced' ? 2 : 1;
  return normalizePrice(Number(product.salePrice) * sizeMultiplier * variantMultiplier);
}
