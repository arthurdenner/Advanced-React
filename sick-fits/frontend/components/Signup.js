import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import Form from './styles/Form';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`;

class Signup extends React.Component {
  state = this.initialState;

  get initialState() {
    return {
      email: '',
      name: '',
      password: '',
    };
  }

  handleChange = e => {
    const { name, value } = e.target;

    this.setState({ [name]: value });
  };

  render() {
    const { email, name, password } = this.state;

    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signup, { error, loading }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await signup();
              this.setState(this.initialState);
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign Up for an Account</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input
                  id="email"
                  name="email"
                  onChange={this.handleChange}
                  placeholder="email"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label htmlFor="name">
                Name
                <input
                  id="name"
                  name="name"
                  onChange={this.handleChange}
                  placeholder="name"
                  required
                  type="text"
                  value={name}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  id="password"
                  name="password"
                  onChange={this.handleChange}
                  placeholder="password"
                  required
                  type="password"
                  value={password}
                />
              </label>

              <button type="submit">Sign Up!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default Signup;
