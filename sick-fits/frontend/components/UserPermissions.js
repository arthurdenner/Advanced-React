import React from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { possiblePermissions } from '../config';
import SickButton from './styles/SickButton';

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION(
    $userId: ID!
    $permissions: [Permission]
  ) {
    updatePermissions(userId: $userId, permissions: $permissions) {
      id
      permissions
      name
      email
    }
  }
`;

class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  };

  state = {
    permissions: this.props.user.permissions,
  };

  handlePermissionChange = e => {
    const { checked, value } = e.target;

    this.setState(({ permissions }) => {
      if (checked) {
        return {
          permissions: permissions.concat(value),
        };
      } else {
        return {
          permissions: permissions.filter(permission => permission !== value),
        };
      }
    });
  };

  render() {
    const { user } = this.props;
    const { permissions } = this.state;

    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{ permissions, userId: user.id }}
      >
        {(updatePermissions, { loading, error }) => (
          <React.Fragment>
            {error && (
              <tr>
                <td colspan="8">
                  <Error error={error} />
                </td>
              </tr>
            )}
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map(permission => {
                const inputId = `${user.id}-permission-${permission}`;

                return (
                  <td key={permission}>
                    <label htmlFor={inputId}>
                      <input
                        id={inputId}
                        checked={permissions.includes(permission)}
                        onChange={this.handlePermissionChange}
                        type="checkbox"
                        value={permission}
                      />
                    </label>
                  </td>
                );
              })}
              <td>
                <SickButton
                  type="button"
                  disabled={loading}
                  onClick={updatePermissions}
                >
                  Updat{loading ? 'ing' : 'e'}
                </SickButton>
              </td>
            </tr>
          </React.Fragment>
        )}
      </Mutation>
    );
  }
}

export default UserPermissions;
