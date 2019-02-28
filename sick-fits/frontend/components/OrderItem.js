import React from 'react';
import PropTypes from 'prop-types';
import formatMoney from '../lib/formatMoney';

const OrderItem = ({ item }) => (
  <div className="order-item">
    <img src={item.image} alt={item.title} />
    <div className="item-details">
      <h2>{item.title}</h2>
      <p>Qty: {item.quantity}</p>
      <p>Each: {formatMoney(item.price)}</p>
      <p>SubTotal: {formatMoney(item.price * item.quantity)}</p>
      <p>{item.description}</p>
    </div>
  </div>
);

OrderItem.propTypes = {
  item: PropTypes.object.isRequired,
};

export default OrderItem;
