import React from 'react';
import { Query } from 'react-apollo';
import Signin from './Signin';
import { CURRENT_USER_QUERY } from './User';

const PleaseSignIn = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading) {
        return <p>Loading...</p>;
      }

      if (!data.me) {
        return (
          <div>
            <p>Please Sign In before Continuing</p>
            <Signin redirectAfterSuccess={false} />
          </div>
        );
      }

      return props.children;
    }}
  </Query>
);

export default PleaseSignIn;
