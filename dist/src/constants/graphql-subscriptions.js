import _taggedTemplateLiteral from 'babel-runtime/helpers/taggedTemplateLiteral';

var _templateObject = _taggedTemplateLiteral(['\n  subscription PostAdded($sessionId: ID!){\n    postAdded(sessionId: $sessionId) {\n      id\n      postBy\n      message\n      iat\n      status{\n        receiver\n        unread\n      }\n      sessionId\n    }\n  }\n'], ['\n  subscription PostAdded($sessionId: ID!){\n    postAdded(sessionId: $sessionId) {\n      id\n      postBy\n      message\n      iat\n      status{\n        receiver\n        unread\n      }\n      sessionId\n    }\n  }\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n  subscription FriendAdded($userId: String!){\n    friendAdded(userId: $userId){\n      id\n      initiator{\n        username\n        photo{\n          file\n        }\n      }\n      validateMessage\n    }\n  }\n'], ['\n  subscription FriendAdded($userId: String!){\n    friendAdded(userId: $userId){\n      id\n      initiator{\n        username\n        photo{\n          file\n        }\n      }\n      validateMessage\n    }\n  }\n']),
    _templateObject3 = _taggedTemplateLiteral(['\n  subscription FriendApproved($userId: String!){\n    friendApproved(userId: $userId){\n      id\n      initiator{\n        username\n        photo{\n          file\n        }\n      }\n      validateMessage\n    }\n  }\n'], ['\n  subscription FriendApproved($userId: String!){\n    friendApproved(userId: $userId){\n      id\n      initiator{\n        username\n        photo{\n          file\n        }\n      }\n      validateMessage\n    }\n  }\n']),
    _templateObject4 = _taggedTemplateLiteral(['\n  subscription TokenExpired($token: String){\n    tokenExpired(token: $token)\n  }\n'], ['\n  subscription TokenExpired($token: String){\n    tokenExpired(token: $token)\n  }\n']);

import gql from 'graphql-tag';

export var PostAddedSubscription = gql(_templateObject);
export var FriendAddedSubscription = gql(_templateObject2);
export var FriendApprovedSubscription = gql(_templateObject3);
export var TokenExpiredSubscription = gql(_templateObject4);
//# sourceMappingURL=graphql-subscriptions.js.map