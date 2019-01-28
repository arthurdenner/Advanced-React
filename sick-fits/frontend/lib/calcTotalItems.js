export default function lccalcTotalItems(cart) {
  return cart
    .filter(cartItem => cartItem.item)
    .reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}
