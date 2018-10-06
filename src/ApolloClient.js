import { ApolloClient } from 'apollo-client'
import { createUploadLink } from 'apollo-upload-client'
import { ApolloLink, split } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { withClientState } from 'apollo-link-state'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import merge from 'lodash.merge'
import { GRAPHQL_ENDPOINTS, GRAPHQL_WEBSOCKET_ENDPOINTS } from './constants/settings'
import { AuthPayload } from './store/AuthPayload'
import { LoadingStatus } from './store/LoadingStatus'
import { getToken } from './utils'

const cache = new InMemoryCache()

const authLink = setContext(async (request) => ({headers: {authorization: `Bearer ${await getToken()}`}}))
const stateLink = withClientState({
  ...merge(AuthPayload, LoadingStatus),
  cache
})
const httpLink = createUploadLink({
  uri: GRAPHQL_ENDPOINTS
})
// https://github.com/apollographql/apollo-server/issues/1505
const subscriptionMiddleware = {
  applyMiddleware: async (options, next) => {
    options.authToken = `Bearer ${await getToken()}`
    next()
  }
}
const wsLink = new WebSocketLink({
  uri: GRAPHQL_WEBSOCKET_ENDPOINTS,
  options: {
    reconnect: true
  }
})
wsLink.subscriptionClient.use([subscriptionMiddleware])
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  ApolloLink.from([stateLink, authLink, httpLink])
)
export default new ApolloClient({
  cache,
  link,
  connectToDevTools: true
})
