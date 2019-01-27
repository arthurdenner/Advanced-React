import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

const ADD_TO_CART_MUTATION = gql`
  mutation ADD_TO_CART_MUTATION($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`;

const AddToCart = ({ id }) => (
  <Mutation mutation={ADD_TO_CART_MUTATION} variables={{ id }}>
    {addToCart => (
      <button
        onClick={() => {
          addToCart().catch(err => {
            alert(err.message);
          });
        }}
      >
        Add To Cart 🛒
      </button>
    )}
  </Mutation>
);

export default AddToCart;
