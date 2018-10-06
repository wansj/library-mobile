import gql from 'graphql-tag'

export const AuthPayload = {
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
      updateAuthPayload: (_, { token, user }, { cache }) => {
        const { role, statistics, photo, ...rest } = user
        const { recentRead, ...others } = statistics
        const data = {
          authPayload: {
            __typename: 'LoggedUser',
            token,
            user: {
              __typename: 'User',
              ...rest,
              photo: {
                __typename: 'File',
                file: {
                  __typename: 'Upload',
                  ...photo.file
                }
              },
              role: {
                __typename: 'Role',
                ...role
              },
              statistics: {
                __typename: 'Statistics',
                ...others,
                recentRead: [...recentRead]
              }
            }
          }
        }
        cache.writeData({ data })
        return null
      }
    }
  }
}
export const UpdateAuthPayloadMutation = gql`
  mutation UpdateAuthPayload($token: String, $user: User){
    updateAuthPayload(token: $token, user: $user) @client
  }
`
export const GetAuthPayloadQuery = gql`
  query GetAuthPayload { 
    authPayload @client {
      token
      user { 
        id
        username
        department
        loged
        email
        role {
          name
          description
          isAdmin
          maxHoldCount
          maxDelayDays
          maxDelayTimes
          maxBorrowDuration
        }
        statistics {
          maxHoldCount
          readCount
          interests
          recentRead
          credit
        }
      }
    }
  }
`
