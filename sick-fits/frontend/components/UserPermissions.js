import React from 'react';
import PropTypes from 'prop-types';
import { possiblePermissions } from '../config';
import SickButton from './styles/SickButton';

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
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission => (
          <td key={permission}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input
                checked={permissions.includes(permission)}
                onChange={this.handlePermissionChange}
                type="checkbox"
                value={permission}
              />
            </label>
          </td>
        ))}
        <td>
          <SickButton>Update</SickButton>
        </td>
      </tr>
    );
  }
}

export default UserPermissions;
