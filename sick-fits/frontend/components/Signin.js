import React from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import Form from './styles/Form';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`;

class Signin extends React.Component {
  static propTypes = {
    redirectAfterSuccess: PropTypes.bool,
  };

  static defaultProps = {
    redirectAfterSuccess: true,
  };

  state = {
    email: '',
    password: '',
  };

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  };

  render() {
    const { redirectAfterSuccess } = this.props;
    const { email, password } = this.state;

    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signup, { error, loading }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await signup();
              if (redirectAfterSuccess) {
                Router.push('/');
              }
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign into your account</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input
                  name="email"
                  onChange={this.handleChange}
                  placeholder="email"
                  type="email"
                  value={email}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  name="password"
                  onChange={this.handleChange}
                  placeholder="password"
                  type="password"
                  value={password}
                />
              </label>

              <button type="submit">Sign In!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Signin;
