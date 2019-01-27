import React from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import Form from './styles/Form';

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`;

class ResetPassword extends React.Component {
  static propTypes = {
    resetToken: PropTypes.string.isRequired,
  };

  state = this.initialState;

  get initialState() {
    return {
      password: '',
      confirmPassword: '',
    };
  }

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  };

  render() {
    const { resetToken } = this.props;
    const { confirmPassword, password } = this.state;

    return (
      <Mutation
        mutation={RESET_PASSWORD_MUTATION}
        variables={{ ...this.state, resetToken }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(reset, { error, loading, called }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await reset();
              Router.push('/');
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Reset your Password</h2>
              <Error error={error} />
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

              <label htmlFor="confirmPassword">
                Confirm Your Password
                <input
                  name="confirmPassword"
                  onChange={this.handleChange}
                  placeholder="confirm your password"
                  type="password"
                  value={confirmPassword}
                />
              </label>

              <button type="submit">Reset Your Password!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default ResetPassword;
