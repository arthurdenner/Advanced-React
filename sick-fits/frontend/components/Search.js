import React from 'react';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import Downshift, { resetIdCounter } from 'downshift';
import debounce from 'lodash.debounce';
import Error from './ErrorMessage';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`;

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: { id: item.id },
  });
}

class Search extends React.Component {
  state = {
    error: null,
    items: [],
    loading: false,
  };

  onChange = debounce(async (e, client) => {
    try {
      this.setState({ loading: true });

      const res = await client.query({
        query: SEARCH_ITEMS_QUERY,
        variables: { searchTerm: e.target.value },
      });

      this.setState({
        items: res.data.items,
        loading: false,
      });
    } catch (err) {
      this.setState({
        error: err,
        loading: false,
      });
    }
  }, 350);

  render() {
    const { error, loading, items } = this.state;

    resetIdCounter();

    return (
      <SearchStyles>
        <Downshift onChange={routeToItem} itemToString={item => item ? item.title : ''}>
          {({
            getInputProps,
            getItemProps,
            highlightedIndex,
            inputValue,
            isOpen,
          }) => (
            <div>
              <Error error={error} />
              <ApolloConsumer>
                {client => (
                  <input
                    {...getInputProps({
                      className: loading ? 'loading' : '',
                      id: 'search',
                      placeholder: 'Search for an item',
                      type: 'search',
                      onChange: e => {
                        e.persist();
                        this.onChange(e, client);
                      },
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown>
                  {items.map((item, index) => (
                    <DropDownItem
                      {...getItemProps({ item })}
                      key={item.id}
                      highlighted={index === highlightedIndex}
                    >
                      <img width="50" src={item.image} alt={item.title} />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {!items.length && !loading && (
                    <DropDownItem> Nothing found for {inputValue}</DropDownItem>
                  )}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}

export default Search;
