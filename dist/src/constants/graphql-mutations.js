import _taggedTemplateLiteral from 'babel-runtime/helpers/taggedTemplateLiteral';

var _templateObject = _taggedTemplateLiteral(['\n  mutation logIn($username: String!, $password: String!){\n    logIn(username: $username, password: $password){\n      token\n      user{\n        id\n        username\n        department\n        loged\n        email\n        photo{\n          file\n        }\n        role{\n          isAdmin\n          name\n          description\n          maxHoldCount\n          maxDelayDays\n          maxDelayTimes\n          maxBorrowDuration\n        }\n        statistics{\n          maxHoldCount\n          readCount\n          interests\n          recentRead{\n              book{\n                id\n                title\n              }\n          }\n          credit\n        }\n      }\n    }\n  }\n'], ['\n  mutation logIn($username: String!, $password: String!){\n    logIn(username: $username, password: $password){\n      token\n      user{\n        id\n        username\n        department\n        loged\n        email\n        photo{\n          file\n        }\n        role{\n          isAdmin\n          name\n          description\n          maxHoldCount\n          maxDelayDays\n          maxDelayTimes\n          maxBorrowDuration\n        }\n        statistics{\n          maxHoldCount\n          readCount\n          interests\n          recentRead{\n              book{\n                id\n                title\n              }\n          }\n          credit\n        }\n      }\n    }\n  }\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n  mutation LogOut{\n    logOut\n  }\n'], ['\n  mutation LogOut{\n    logOut\n  }\n']),
    _templateObject3 = _taggedTemplateLiteral(['\n  mutation SignUp($username: String!, $password: String!, $department: String!, $role: ID!, $email: String!, $avatar: String){\n    signUp(username: $username, password: $password, department: $department, role: $role, email: $email, avatar: $avatar){\n      token\n      user{\n        id\n        username\n        department\n        loged\n        email\n        photo{\n          file\n        }\n        role{\n          name\n          isAdmin\n          description\n          maxHoldCount\n          maxDelayDays\n          maxDelayTimes\n          maxBorrowDuration\n        }\n        statistics{\n          maxHoldCount\n          readCount\n          interests\n          recentRead{\n              book{\n                id\n                title\n              }\n          }\n          credit\n        }\n      }\n    }\n  }\n'], ['\n  mutation SignUp($username: String!, $password: String!, $department: String!, $role: ID!, $email: String!, $avatar: String){\n    signUp(username: $username, password: $password, department: $department, role: $role, email: $email, avatar: $avatar){\n      token\n      user{\n        id\n        username\n        department\n        loged\n        email\n        photo{\n          file\n        }\n        role{\n          name\n          isAdmin\n          description\n          maxHoldCount\n          maxDelayDays\n          maxDelayTimes\n          maxBorrowDuration\n        }\n        statistics{\n          maxHoldCount\n          readCount\n          interests\n          recentRead{\n              book{\n                id\n                title\n              }\n          }\n          credit\n        }\n      }\n    }\n  }\n']),
    _templateObject4 = _taggedTemplateLiteral(['\n  mutation UploadFileMutation($file: Upload!, $tag: Tags!) {\n    singleUpload(file: $file, tag: $tag){\n      id\n    }\n  }\n'], ['\n  mutation UploadFileMutation($file: Upload!, $tag: Tags!) {\n    singleUpload(file: $file, tag: $tag){\n      id\n    }\n  }\n']),
    _templateObject5 = _taggedTemplateLiteral(['\n  mutation ChangePassword($email: String!, $password: String!){\n    changePassword(email: $email, password: $password){\n      id\n    }\n  }\n'], ['\n  mutation ChangePassword($email: String!, $password: String!){\n    changePassword(email: $email, password: $password){\n      id\n    }\n  }\n']),
    _templateObject6 = _taggedTemplateLiteral(['\n  mutation EditUser($userId: ID!, $username: String, $password: String, $department: String, $role: ID, $email: String, $avatar: String){\n    editUser(userId: $userId, username: $username, password: $password, department: $department, role: $role, email: $email, avatar: $avatar){\n      id\n    }\n  }\n'], ['\n  mutation EditUser($userId: ID!, $username: String, $password: String, $department: String, $role: ID, $email: String, $avatar: String){\n    editUser(userId: $userId, username: $username, password: $password, department: $department, role: $role, email: $email, avatar: $avatar){\n      id\n    }\n  }\n']),
    _templateObject7 = _taggedTemplateLiteral(['\n  mutation DelFromCollection($userId: ID!, $bookIds: [ID!]!){\n    delFromCollection(userId: $userId, bookIds: $bookIds){\n      id  \n    }\n  }\n'], ['\n  mutation DelFromCollection($userId: ID!, $bookIds: [ID!]!){\n    delFromCollection(userId: $userId, bookIds: $bookIds){\n      id  \n    }\n  }\n']),
    _templateObject8 = _taggedTemplateLiteral(['\n  mutation AddToCollection($userId:ID!, $bookId: ID!){\n    addToCollection(userId: $userId, bookId: $bookId)\n  }\n'], ['\n  mutation AddToCollection($userId:ID!, $bookId: ID!){\n    addToCollection(userId: $userId, bookId: $bookId)\n  }\n']),
    _templateObject9 = _taggedTemplateLiteral(['\n  mutation ThumbsBookComment($id: ID!, $userId: String!){\n    thumbBookComment(id: $id, userId: $userId){\n      thumbs\n    }\n  }\n'], ['\n  mutation ThumbsBookComment($id: ID!, $userId: String!){\n    thumbBookComment(id: $id, userId: $userId){\n      thumbs\n    }\n  }\n']),
    _templateObject10 = _taggedTemplateLiteral(['\n  mutation PostBookComment($comment: BookCommentInput!){\n    addBookComment(comment: $comment){\n      id\n    }\n  }\n'], ['\n  mutation PostBookComment($comment: BookCommentInput!){\n    addBookComment(comment: $comment){\n      id\n    }\n  }\n']),
    _templateObject11 = _taggedTemplateLiteral(['\n  mutation AddToCart($userId: String!, $bookId: String!){\n    addToCart(userId: $userId, bookId: $bookId)\n  }\n'], ['\n  mutation AddToCart($userId: String!, $bookId: String!){\n    addToCart(userId: $userId, bookId: $bookId)\n  }\n']),
    _templateObject12 = _taggedTemplateLiteral(['\n  mutation RemoveFromCart($bookId: String!){\n    removeFromCart(bookId: $bookId)\n  }\n'], ['\n  mutation RemoveFromCart($bookId: String!){\n    removeFromCart(bookId: $bookId)\n  }\n']),
    _templateObject13 = _taggedTemplateLiteral(['\n  mutation MoveFromCartToCollection($bookId: String!){\n    moveFromCartToCollection(bookId: $bookId)\n  }\n'], ['\n  mutation MoveFromCartToCollection($bookId: String!){\n    moveFromCartToCollection(bookId: $bookId)\n  }\n']),
    _templateObject14 = _taggedTemplateLiteral(['\n  mutation AddToBorrowPlan($bookIds: [String!]!, $expireAt: Date!){\n    addToBorrowPlan(bookIds: $bookIds, expireAt: $expireAt)\n  }\n'], ['\n  mutation AddToBorrowPlan($bookIds: [String!]!, $expireAt: Date!){\n    addToBorrowPlan(bookIds: $bookIds, expireAt: $expireAt)\n  }\n']),
    _templateObject15 = _taggedTemplateLiteral(['\n  mutation RemoveFromBorrowPlan($bookIds: [String!]!){\n    removeFromBorrowPlan(bookIds: $bookIds)\n  }\n'], ['\n  mutation RemoveFromBorrowPlan($bookIds: [String!]!){\n    removeFromBorrowPlan(bookIds: $bookIds)\n  }\n']),
    _templateObject16 = _taggedTemplateLiteral(['\n  mutation MoveToCart($bookId: String!){\n    moveToCart(bookId: $bookId)\n  }\n'], ['\n  mutation MoveToCart($bookId: String!){\n    moveToCart(bookId: $bookId)\n  }\n']),
    _templateObject17 = _taggedTemplateLiteral(['\n  mutation AddToSubs($isbn: String!){\n    addToSubscription(isbn: $isbn)\n  }\n'], ['\n  mutation AddToSubs($isbn: String!){\n    addToSubscription(isbn: $isbn)\n  }\n']),
    _templateObject18 = _taggedTemplateLiteral(['\n  mutation RemoveFromSub($isbn: String!){\n    removeFromSubscription(isbn: $isbn)\n  }\n'], ['\n  mutation RemoveFromSub($isbn: String!){\n    removeFromSubscription(isbn: $isbn)\n  }\n']),
    _templateObject19 = _taggedTemplateLiteral(['\n  mutation AddPost($message: String!, $messageType: String, $sessionId: ID!){\n    addPost(message: $message, messageType: $messageType, sessionId: $sessionId){\n      id\n      postBy\n      message\n    }\n  }\n'], ['\n  mutation AddPost($message: String!, $messageType: String, $sessionId: ID!){\n    addPost(message: $message, messageType: $messageType, sessionId: $sessionId){\n      id\n      postBy\n      message\n    }\n  }\n']),
    _templateObject20 = _taggedTemplateLiteral(['\n  mutation AddFriend($friend: ID!, $validateMessage: String!){\n    addFriend(friend: $friend, validateMessage: $validateMessage){\n      id\n    }\n  }\n'], ['\n  mutation AddFriend($friend: ID!, $validateMessage: String!){\n    addFriend(friend: $friend, validateMessage: $validateMessage){\n      id\n    }\n  }\n']),
    _templateObject21 = _taggedTemplateLiteral(['\n  mutation ApproveFriendship($id: ID){\n    approveFriendship(id: $id){\n      id\n    }\n  }\n'], ['\n  mutation ApproveFriendship($id: ID){\n    approveFriendship(id: $id){\n      id\n    }\n  }\n']),
    _templateObject22 = _taggedTemplateLiteral(['\n  mutation CommitFeedback($category: FeedbackCategories!, $description: String!){\n    commitFeedback(category: $category, description: $description)\n  }\n'], ['\n  mutation CommitFeedback($category: FeedbackCategories!, $description: String!){\n    commitFeedback(category: $category, description: $description)\n  }\n']),
    _templateObject23 = _taggedTemplateLiteral(['\n  mutation AddToReturnPlan($bookIds: [String!]!, $expireAt: Date!){\n    addToReturnPlan(bookIds: $bookIds, expireAt: $expireAt)\n  }\n'], ['\n  mutation AddToReturnPlan($bookIds: [String!]!, $expireAt: Date!){\n    addToReturnPlan(bookIds: $bookIds, expireAt: $expireAt)\n  }\n']),
    _templateObject24 = _taggedTemplateLiteral(['\n  mutation CreateReadPlan($plans: [PlanInput!]!, $title: String!){\n    createReadPlan(plans: $plans, title: $title){\n      id\n    }\n  }\n'], ['\n  mutation CreateReadPlan($plans: [PlanInput!]!, $title: String!){\n    createReadPlan(plans: $plans, title: $title){\n      id\n    }\n  }\n']),
    _templateObject25 = _taggedTemplateLiteral(['\n  mutation DeleteReadPlan($id: ID!){\n    delReadPlan(id: $id)\n  }\n'], ['\n  mutation DeleteReadPlan($id: ID!){\n    delReadPlan(id: $id)\n  }\n']);

import gql from 'graphql-tag';

export var LogInMutation = gql(_templateObject);
export var LogOutMutation = gql(_templateObject2);
export var SignUpMutation = gql(_templateObject3);
export var UploadFileMutation = gql(_templateObject4);
export var ChangePasswordMutation = gql(_templateObject5);
export var EditUserMutation = gql(_templateObject6);
export var DelFromCollectionMutation = gql(_templateObject7);
export var AddToCollectionMutation = gql(_templateObject8);
export var ThumbsBookCommentMutation = gql(_templateObject9);
export var PostBookCommentMutation = gql(_templateObject10);
export var AddToCartMutation = gql(_templateObject11);
export var RemoveFromCartMutation = gql(_templateObject12);
export var MoveFromCartToCollection = gql(_templateObject13);
export var AddToBorrowPlanMutation = gql(_templateObject14);
export var RemoveFromBorrowPlanMutation = gql(_templateObject15);
export var MoveToCartMutation = gql(_templateObject16);
export var AddToSubsMutation = gql(_templateObject17);
export var RemoveFromSubMutation = gql(_templateObject18);
export var AddPostMutation = gql(_templateObject19);
export var AddFriendMutation = gql(_templateObject20);
export var ApproveFriendshipMutation = gql(_templateObject21);
export var CommitFeedbackMutation = gql(_templateObject22);
export var AddToReturnPlanMutation = gql(_templateObject23);
export var CreateReadPlanMutation = gql(_templateObject24);
export var DeleteReadPlanMutation = gql(_templateObject25);
//# sourceMappingURL=graphql-mutations.js.map