import gql from "graphql-tag";

export const ME = gql`
  query me {
    user(login: "hso92") {
      name
      avatarUrl
    }
  }
`;
