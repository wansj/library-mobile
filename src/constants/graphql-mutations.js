import gql from 'graphql-tag'

export const LogInMutation = gql`
  mutation logIn($username: String!, $password: String!){
    logIn(username: $username, password: $password){
      token
      user{
        id
        username
        department
        loged
        email
        photo{
          file
        }
        role{
          isAdmin
          name
          description
          maxHoldCount
          maxDelayDays
          maxDelayTimes
          maxBorrowDuration
        }
        statistics{
          maxHoldCount
          readCount
          interests
          recentRead{
              book{
                id
                title
              }
          }
          credit
        }
      }
    }
  }
`
export const LogOutMutation = gql`
  mutation LogOut{
    logOut
  }
`
export const SignUpMutation = gql`
  mutation SignUp($username: String!, $password: String!, $department: String!, $role: ID!, $email: String!, $avatar: String){
    signUp(username: $username, password: $password, department: $department, role: $role, email: $email, avatar: $avatar){
      token
      user{
        id
        username
        department
        loged
        email
        photo{
          file
        }
        role{
          name
          isAdmin
          description
          maxHoldCount
          maxDelayDays
          maxDelayTimes
          maxBorrowDuration
        }
        statistics{
          maxHoldCount
          readCount
          interests
          recentRead{
              book{
                id
                title
              }
          }
          credit
        }
      }
    }
  }
`
export const UploadFileMutation = gql`
  mutation UploadFileMutation($file: Upload!, $tag: Tags!) {
    singleUpload(file: $file, tag: $tag){
      id
    }
  }
`
export const ChangePasswordMutation = gql`
  mutation ChangePassword($email: String!, $password: String!){
    changePassword(email: $email, password: $password){
      id
    }
  }
`
export const EditUserMutation = gql`
  mutation EditUser($userId: ID!, $username: String, $password: String, $department: String, $role: ID, $email: String, $avatar: String){
    editUser(userId: $userId, username: $username, password: $password, department: $department, role: $role, email: $email, avatar: $avatar){
      id
    }
  }
`
export const DelFromCollectionMutation = gql`
  mutation DelFromCollection($userId: ID!, $bookIds: [ID!]!){
    delFromCollection(userId: $userId, bookIds: $bookIds){
      id  
    }
  }
`
export const AddToCollectionMutation = gql`
  mutation AddToCollection($userId:ID!, $bookId: ID!){
    addToCollection(userId: $userId, bookId: $bookId)
  }
`
export const ThumbsBookCommentMutation = gql`
  mutation ThumbsBookComment($id: ID!, $userId: String!){
    thumbBookComment(id: $id, userId: $userId){
      thumbs
    }
  }
`
export const PostBookCommentMutation = gql`
  mutation PostBookComment($comment: BookCommentInput!){
    addBookComment(comment: $comment){
      id
    }
  }
`
export const AddToCartMutation = gql`
  mutation AddToCart($userId: String!, $bookId: String!){
    addToCart(userId: $userId, bookId: $bookId)
  }
`
export const RemoveFromCartMutation = gql`
  mutation RemoveFromCart($bookId: String!){
    removeFromCart(bookId: $bookId)
  }
`
export const MoveFromCartToCollection = gql`
  mutation MoveFromCartToCollection($bookId: String!){
    moveFromCartToCollection(bookId: $bookId)
  }
`
export const AddToBorrowPlanMutation = gql`
  mutation AddToBorrowPlan($bookIds: [String!]!, $expireAt: Date!){
    addToBorrowPlan(bookIds: $bookIds, expireAt: $expireAt)
  }
`
export const RemoveFromBorrowPlanMutation = gql`
  mutation RemoveFromBorrowPlan($bookIds: [String!]!){
    removeFromBorrowPlan(bookIds: $bookIds)
  }
`
export const MoveToCartMutation = gql`
  mutation MoveToCart($bookId: String!){
    moveToCart(bookId: $bookId)
  }
`
export const AddToSubsMutation = gql`
  mutation AddToSubs($isbn: String!){
    addToSubscription(isbn: $isbn)
  }
`
export const RemoveFromSubMutation = gql`
  mutation RemoveFromSub($isbn: String!){
    removeFromSubscription(isbn: $isbn)
  }
`
export const AddPostMutation = gql`
  mutation AddPost($message: String!, $messageType: String, $sessionId: ID!){
    addPost(message: $message, messageType: $messageType, sessionId: $sessionId){
      id
      postBy
      message
    }
  }
`
export const AddFriendMutation = gql`
  mutation AddFriend($friend: ID!, $validateMessage: String!){
    addFriend(friend: $friend, validateMessage: $validateMessage){
      id
    }
  }
`
export const ApproveFriendshipMutation = gql`
  mutation ApproveFriendship($id: ID){
    approveFriendship(id: $id){
      id
    }
  }
`
export const CommitFeedbackMutation = gql`
  mutation CommitFeedback($category: FeedbackCategories!, $description: String!){
    commitFeedback(category: $category, description: $description)
  }
`
export const AddToReturnPlanMutation = gql`
  mutation AddToReturnPlan($bookIds: [String!]!, $expireAt: Date!){
    addToReturnPlan(bookIds: $bookIds, expireAt: $expireAt)
  }
`
export const CreateReadPlanMutation = gql`
  mutation CreateReadPlan($plans: [PlanInput!]!, $title: String!){
    createReadPlan(plans: $plans, title: $title){
      id
    }
  }
`
export const DeleteReadPlanMutation = gql`
  mutation DeleteReadPlan($id: ID!){
    delReadPlan(id: $id)
  }
`
