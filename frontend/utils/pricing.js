/**
 * Storefront/admin helpers for the three-price product model.
 */

export function getSellingPrice(product) {
  return Number(product?.sellingPrice ?? product?.price ?? 0)
}

export function getDiscountedPrice(product) {
  const value = product?.discountedPrice
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}

/** True when a promo price is set and lower than selling price. */
export function hasActiveDiscount(product) {
  const selling = getSellingPrice(product)
  const discounted = getDiscountedPrice(product)
  return discounted != null && discounted < selling
}

/** Price charged to the customer (promo or selling). */
export function getChargePrice(product) {
  if (hasActiveDiscount(product)) return getDiscountedPrice(product)
  return getSellingPrice(product)
}

/** Whole-number percent off, or null when no active discount. */
export function getDiscountPercent(product) {
  if (!hasActiveDiscount(product)) return null
  const selling = getSellingPrice(product)
  if (selling <= 0) return null
  return Math.round(((selling - getDiscountedPrice(product)) / selling) * 100)
}

export function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`
}
