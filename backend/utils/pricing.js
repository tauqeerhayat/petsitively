/**
 * Charge price = active discountedPrice when lower than sellingPrice, else sellingPrice.
 */
function getChargePrice(product) {
  const selling = Number(product?.sellingPrice);
  const discounted = product?.discountedPrice;

  if (
    discounted != null &&
    discounted !== '' &&
    !Number.isNaN(Number(discounted)) &&
    Number(discounted) < selling
  ) {
    return Number(discounted);
  }

  return selling;
}

function normalizeDiscountedPrice(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return num;
}

module.exports = {
  getChargePrice,
  normalizeDiscountedPrice,
};
