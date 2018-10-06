import gql from 'graphql-tag'

export const LoadingStatus = {
  defaults: {
    loadingStatus: {
      __typename: 'LoadingStatus',
      loading: false
    }
  },
  resolvers: {
    Mutation: {
      updateLoadingStatus: (_, { loading }, { cache }) => {
        const data = {
          loadingStatus: {
            __typename: 'LoadingStatus',
            loading
          }
        }
        cache.writeData({ data })
        return null
      }
    }
  }
}
export const UpdateLoadingStatusMutation = gql`
  mutation UpdateLoadingStatus($loading: Boolean!){
    updateLoadingStatus(loading: $loading) @client
  }
`
export const GetLoadingStatusQuery = gql`
  query GetLoadingStatus{
    loadingStatus @client
  }
`
