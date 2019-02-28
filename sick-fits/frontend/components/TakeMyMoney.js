import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import NProgress from 'nprogress';
import gql from 'graphql-tag';
import calcTotalItems from '../lib/calcTotalItems';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

class TakeMyMoney extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <User>
        {({ data: { me } }) =>
          me.cart.length > 0 && (
            <Mutation
              mutation={CREATE_ORDER_MUTATION}
              refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
              {createOrder => (
                <StripeCheckout
                  amount={calcTotalPrice(me.cart)}
                  name="Sick Fits"
                  description={`Order of ${calcTotalItems(me.cart)} items!`}
                  image={me.cart[0].item && me.cart[0].item.image}
                  stripeKey="pk_test_w7i4UODoGG4Vm3AvBcrF1GW3"
                  currency="USD"
                  email={me.email}
                  token={async res => {
                    try {
                      NProgress.start();

                      const order = await createOrder({
                        variables: { token: res.id },
                      });

                      Router.push({
                        pathname: '/order',
                        query: { id: order.data.createOrder.id },
                      });
                    } catch (err) {
                      alert(err.message);
                    }
                  }}
                >
                  {children}
                </StripeCheckout>
              )}
            </Mutation>
          )
        }
      </User>
    );
  }
}

export default TakeMyMoney;
