import gql from 'graphql-tag'

export const PostAddedSubscription = gql`
  subscription PostAdded($sessionId: ID!){
    postAdded(sessionId: $sessionId) {
      id
      postBy
      message
      iat
      status{
        receiver
        unread
      }
      sessionId
    }
  }
`
export const FriendAddedSubscription = gql`
  subscription FriendAdded($userId: String!){
    friendAdded(userId: $userId){
      id
      initiator{
        username
        photo{
          file
        }
      }
      validateMessage
    }
  }
`
export const FriendApprovedSubscription = gql`
  subscription FriendApproved($userId: String!){
    friendApproved(userId: $userId){
      id
      initiator{
        username
        photo{
          file
        }
      }
      validateMessage
    }
  }
`
export const TokenExpiredSubscription = gql`
  subscription TokenExpired($token: String){
    tokenExpired(token: $token)
  }
`
