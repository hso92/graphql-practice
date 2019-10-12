import React from "react";
import { ApolloProvider, Mutation, Query } from "react-apollo";
import client from "./client";
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITRIES } from "./graphql";

const StarButton = props => {
  const { node } = props;
  const { after, before, first, last, query } = DEFAULT_STATE;
  const totalCount = node.stargazers.totalCount;
  const viewerHasStarred = node.viewerHasStarred;
  const starCount = totalCount === 1 ? "1 star" : `${totalCount} stars`;
  const StarStatus = ({ addOrRemoveStar }) => (
    <button
      onClick={() =>
        addOrRemoveStar({
          variables: { input: { starrableId: node.id } },
          update: (store , {data:{ addStar, removeStar}}) => {
            const {starrable} = addStar || removeStar;
            console.log(starrable)
            const data = store.readQuery({
              query: SEARCH_REPOSITRIES,
              variables: { after, before, first, last, query }
            });
            const edges = data.search.edges;
            const newEdges = edges.map(edge => {
              if (edge.node.id === node.id) {
                const totalCount = edge.node.stargazers.totalCount;
                const diff = starrable.viewerHasStarred ? 1 : -1;
                const newTotalCount = totalCount + diff;
                edge.node.stargazers.totalCount = newTotalCount;
              }
              return edge
            });
            data.search.edges = newEdges
            store.writeQuery({query: SEARCH_REPOSITRIES, data})
          }
        })
      }
    >
      {starCount} | {viewerHasStarred ? "starred" : "-"}
    </button>
  );
  return (
    <Mutation mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}>
      {addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar} />}
    </Mutation>
  );
};

const PER_PAGE = 5;
const DEFAULT_STATE = {
  after: null,
  before: null,
  first: PER_PAGE,
  last: null,
  query: "フロントエンドエンジニア"
};

function App() {
  const [variables, setValroables] = React.useState(DEFAULT_STATE);
  const { after, before, first, last, query } = variables;

  const handleChange = event => {
    setValroables({
      ...DEFAULT_STATE,
      query: event.target.value
    });
  };
  const handleSubmit = event => {
    event.preventDefault();
  };
  const goNext = search => {
    setValroables({
      ...DEFAULT_STATE,
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null
    });
  };
  const goPrevious = search => {
    setValroables({
      ...DEFAULT_STATE,
      last: PER_PAGE,
      before: search.pageInfo.startCursor,
      after: null,
      first: null
    });
  };
  return (
    <ApolloProvider client={client}>
      <form onSubmit={e => handleSubmit(e)}>
        <input value={query} onChange={e => handleChange(e)} />
      </form>
      <Query
        query={SEARCH_REPOSITRIES}
        variables={{ after, before, first, last, query }}
      >
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;

          const search = data.search;
          const repositoryCount = search.repositoryCount;
          const repositoryUnit =
            repositoryCount === 1 ? "Repository" : "Repositories";
          const title = `Github Repositories Search Results - ${repositoryCount} ${repositoryUnit}`;
          return (
            <>
              <h2>{title}</h2>
              <ul>
                {search.edges.map(edge => {
                  const node = edge.node;
                  return (
                    <li key={node.id}>
                      <a
                        href={node.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {node.name}
                      </a>
                      &nbsp;
                      <StarButton node={node} />
                    </li>
                  );
                })}
              </ul>
              {search.pageInfo.hasPreviousPage ? (
                <button onClick={() => goPrevious(search)}>Previous</button>
              ) : null}
              {search.pageInfo.hasNextPage ? (
                <button onClick={() => goNext(search)}>next</button>
              ) : null}
            </>
          );
        }}
      </Query>
    </ApolloProvider>
  );
}

export default App;
