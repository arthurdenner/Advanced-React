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

class TakeMyMoney extends React.Component {
  onToken = res => {
    console.log('On Token Called!');
    console.log(res.id);
  };

  render() {
    const { children } = this.props;

    return (
      <User>
        {({ data: { me } }) => (
          <StripeCheckout
            amount={calcTotalPrice(me.cart)}
            name="Sick Fits"
            description={`Order of ${calcTotalItems(me.cart)} items!`}
            image={me.cart[0].item && me.cart[0].item.image}
            stripeKey="pk_test_Vtknn6vSdcZWSG2JWvEiWSqC"
            currency="USD"
            email={me.email}
            token={res => this.onToken(res)}
          >
            {children}
          </StripeCheckout>
        )}
      </User>
    );
  }
}

export default TakeMyMoney;
