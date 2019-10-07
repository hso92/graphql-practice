import React from "react";
import { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";
import client from "./client";
import { SEARCH_REPOSITRIES } from "./graphql";

const VARIABLES = {
  after: null,
  before: null,
  first: 5,
  last: null,
  query: "フロントエンドエンジニア"
};

function App() {
  const [variables, setValroables] = React.useState(VARIABLES);
  const { after, before, first, last, query } = variables;
  return (
    <ApolloProvider client={client}>
      <Query
        query={SEARCH_REPOSITRIES}
        variables={{ after, before, first, last, query }}
      >
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;

          console.log({ data });
          return <div></div>;
        }}
      </Query>
    </ApolloProvider>
  );
}

export default App;
