import _taggedTemplateLiteral from 'babel-runtime/helpers/taggedTemplateLiteral';

var _templateObject = _taggedTemplateLiteral(['\n  mutation UpdateLoadingStatus($loading: Boolean!){\n    updateLoadingStatus(loading: $loading) @client\n  }\n'], ['\n  mutation UpdateLoadingStatus($loading: Boolean!){\n    updateLoadingStatus(loading: $loading) @client\n  }\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n  query GetLoadingStatus{\n    loadingStatus @client\n  }\n'], ['\n  query GetLoadingStatus{\n    loadingStatus @client\n  }\n']);

import gql from 'graphql-tag';

export var LoadingStatus = {
  defaults: {
    loadingStatus: {
      __typename: 'LoadingStatus',
      loading: false
    }
  },
  resolvers: {
    Mutation: {
      updateLoadingStatus: function updateLoadingStatus(_, _ref, _ref2) {
        var loading = _ref.loading;
        var cache = _ref2.cache;

        var data = {
          loadingStatus: {
            __typename: 'LoadingStatus',
            loading: loading
          }
        };
        cache.writeData({ data: data });
        return null;
      }
    }
  }
};
export var UpdateLoadingStatusMutation = gql(_templateObject);
export var GetLoadingStatusQuery = gql(_templateObject2);
//# sourceMappingURL=LoadingStatus.js.map