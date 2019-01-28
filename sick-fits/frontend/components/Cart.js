import React from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import CartItem from './CartItem';
import User from './User';
import CartStyles from './styles/CartStyles';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import Supreme from './styles/Supreme';

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Cart = () => (
  <User>
    {({ data: { me } }) => {
      if (!me) {
        return null;
      }

      const validItemsCount = me.cart.filter(cartItem => cartItem.item).length;

      return (
        <Mutation mutation={TOGGLE_CART_MUTATION}>
          {toggleCart => (
            <Query query={LOCAL_STATE_QUERY}>
              {({ data }) => (
                <CartStyles open={data.cartOpen}>
                  <header>
                    <CloseButton onClick={toggleCart} title="close">
                      &times;
                    </CloseButton>
                    <Supreme>{me.name}'s Cart</Supreme>
                    <p>
                      You have {validItemsCount} item
                      {validItemsCount === 1 ? '' : 's'} in your cart.
                    </p>
                  </header>
                  <ul>
                    {me.cart.map(cartItem => (
                      <CartItem key={cartItem.id} cartItem={cartItem} />
                    ))}
                  </ul>
                  <footer>
                    <p>{formatMoney(calcTotalPrice(me.cart))}</p>
                    <SickButton>Checkout</SickButton>
                  </footer>
                </CartStyles>
              )}
            </Query>
          )}
        </Mutation>
      );
    }}
  </User>
);

export default Cart;
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
