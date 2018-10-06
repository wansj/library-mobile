import _taggedTemplateLiteral from 'babel-runtime/helpers/taggedTemplateLiteral';
import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import _extends from 'babel-runtime/helpers/extends';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';

var _templateObject = _taggedTemplateLiteral(['\n  mutation UpdateAuthPayload($token: String, $user: User){\n    updateAuthPayload(token: $token, user: $user) @client\n  }\n'], ['\n  mutation UpdateAuthPayload($token: String, $user: User){\n    updateAuthPayload(token: $token, user: $user) @client\n  }\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n  query GetAuthPayload { \n    authPayload @client {\n      token\n      user { \n        id\n        username\n        department\n        loged\n        email\n        role {\n          name\n          description\n          isAdmin\n          maxHoldCount\n          maxDelayDays\n          maxDelayTimes\n          maxBorrowDuration\n        }\n        statistics {\n          maxHoldCount\n          readCount\n          interests\n          recentRead\n          credit\n        }\n      }\n    }\n  }\n'], ['\n  query GetAuthPayload { \n    authPayload @client {\n      token\n      user { \n        id\n        username\n        department\n        loged\n        email\n        role {\n          name\n          description\n          isAdmin\n          maxHoldCount\n          maxDelayDays\n          maxDelayTimes\n          maxBorrowDuration\n        }\n        statistics {\n          maxHoldCount\n          readCount\n          interests\n          recentRead\n          credit\n        }\n      }\n    }\n  }\n']);

import gql from 'graphql-tag';

var AuthPayload = {
  defaults: {
    authPayload: {
      __typename: 'AuthPayload',
      token: '',
      user: {
        __typename: 'User',
        id: '',
        username: '',
        department: '',
        loged: false,
        email: '',
        photo: {
          __typename: 'File',
          file: {
            __typename: 'Upload',
            stream: '',
            mimetype: '',
            filename: '',
            encoding: ''
          }
        },
        role: {
          __typename: 'Role',
          isAdmin: false,
          name: '',
          description: '',
          maxHoldCount: 5,
          maxDelayDays: 15,
          maxDelayTimes: 1,
          maxBorrowDuration: 30
        },
        statistics: {
          __typename: 'Statistics',
          maxHoldCount: 5,
          readCount: 0,
          interests: [],
          recentRead: [],
          credit: 0
        }
      }
    }
  },
  resolvers: {
    Mutation: {
      updateAuthPayload: function updateAuthPayload(_, _ref, _ref2) {
        var token = _ref.token,
            user = _ref.user;
        var cache = _ref2.cache;

        var role = user.role,
            statistics = user.statistics,
            photo = user.photo,
            rest = _objectWithoutProperties(user, ['role', 'statistics', 'photo']);

        var recentRead = statistics.recentRead,
            others = _objectWithoutProperties(statistics, ['recentRead']);

        var data = {
          authPayload: {
            __typename: 'LoggedUser',
            token: token,
            user: _extends({
              __typename: 'User'
            }, rest, {
              photo: {
                __typename: 'File',
                file: _extends({
                  __typename: 'Upload'
                }, photo.file)
              },
              role: _extends({
                __typename: 'Role'
              }, role),
              statistics: _extends({
                __typename: 'Statistics'
              }, others, {
                recentRead: [].concat(_toConsumableArray(recentRead))
              })
            })
          }
        };
        cache.writeData({ data: data });
        return null;
      }
    }
  }
};
export { AuthPayload };
export var UpdateAuthPayloadMutation = gql(_templateObject);
export var GetAuthPayloadQuery = gql(_templateObject2);
//# sourceMappingURL=AuthPayload.js.map