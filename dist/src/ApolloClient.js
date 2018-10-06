import _extends from 'babel-runtime/helpers/extends';
import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';

var _this = this;

import { ApolloClient } from 'apollo-client';
import { createUploadLink } from 'apollo-upload-client';
import { ApolloLink, split } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { withClientState } from 'apollo-link-state';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import merge from 'lodash.merge';
import { GRAPHQL_ENDPOINTS, GRAPHQL_WEBSOCKET_ENDPOINTS } from './constants/settings';
import { AuthPayload } from './store/AuthPayload';
import { LoadingStatus } from './store/LoadingStatus';
import { getToken } from './utils';

var cache = new InMemoryCache();

var authLink = setContext(function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(request) {
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getToken();

          case 2:
            _context.t0 = _context.sent;
            _context.t1 = 'Bearer ' + _context.t0;
            _context.t2 = {
              authorization: _context.t1
            };
            return _context.abrupt('return', {
              headers: _context.t2
            });

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());
var stateLink = withClientState(_extends({}, merge(AuthPayload, LoadingStatus), {
  cache: cache
}));
var httpLink = createUploadLink({
  uri: GRAPHQL_ENDPOINTS
});
// https://github.com/apollographql/apollo-server/issues/1505
var subscriptionMiddleware = {
  applyMiddleware: function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(options, next) {
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return getToken();

            case 2:
              _context2.t0 = _context2.sent;
              options.authToken = 'Bearer ' + _context2.t0;

              next();

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function applyMiddleware(_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }()
};
var wsLink = new WebSocketLink({
  uri: GRAPHQL_WEBSOCKET_ENDPOINTS,
  options: {
    reconnect: true
  }
});
wsLink.subscriptionClient.use([subscriptionMiddleware]);
var link = split(
// split based on operation type
function (_ref3) {
  var query = _ref3.query;

  var _getMainDefinition = getMainDefinition(query),
      kind = _getMainDefinition.kind,
      operation = _getMainDefinition.operation;

  return kind === 'OperationDefinition' && operation === 'subscription';
}, wsLink, ApolloLink.from([stateLink, authLink, httpLink]));
export default new ApolloClient({
  cache: cache,
  link: link,
  connectToDevTools: true
});
//# sourceMappingURL=ApolloClient.js.map