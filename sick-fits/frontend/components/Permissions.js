import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { possiblePermissions } from '../config';
import Error from './ErrorMessage';
import UserPermissions from './UserPermissions';
import Table from './styles/Table';

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => {
      if (loading) {
        return <p>Loading...</p>;
      }

      if (error) {
        return <Error error={error} />;
      }

      return (
        <div>
          <div>
            <h2>Manage Permissions</h2>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {possiblePermissions.map(permission => (
                    <th key={permission}>{permission}</th>
                  ))}
                  <th>👇🏻</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(user => (
                  <UserPermissions key={user.id} user={user} />
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      );
    }}
  </Query>
);

export default Permissions;
