import gql from 'graphql-tag'

export const GetPublicKeyQuery = gql`
  query GetPublicKey{
    publicKey
  }
`
export const GetAvailableRolesQuery = gql`
  query GetAvailableRoles{
    availableRoles{
      id
      name
    }
  }
`
export const GetFileByIDQuery = gql`
  query GetFileByID($id: ID!){
    fileByID(id: $id){
      file
    }
  }
`
export const GetCaptchaQuery = gql`
  query GetCaptcha($email: String!){
    getCaptcha(email: $email)
  }
`
export const GetLogedUserQuery = gql`
  query GetLogedUser{
    logedUser{
      id
      username
      department
      loged
      email
      avatar
      photo{
        file
      }
      role{
        id
        isAdmin
        name
        maxBorrowDuration
        maxHoldCount
        maxDelayTimes
        maxDelayDays
      }
      statistics{
        maxHoldCount
        readCount
        interests
        recentRead{
            book{
              id
              title
              picture{
                file
              }
            }
        }
        credit
      }
    }
  }
`
export const GetRecordsQuery = gql`
  query GetRecords($skip: Int!, $limit: Int!, $filter: RecordsFilter){
    records(skip: $skip, limit: $limit, filter: $filter){
      id
      book{
        id
        title
        picture{
          file
        }
        authors
        summary
      }
      date
      deadline
      returnDate
      timeout
    }
  }
`
export const GetCollectionQuery = gql`
  query GetCollection($userId: ID!, $skip: Int, $limit: Int){
    collection(userId: $userId, skip: $skip, limit: $limit){
      id
      title
      summary
      picture{
        file
      }
    }
  }
`
export const GetCollectedBooksQuery = gql`
  query GetCollection($userId: ID!, $skip: Int, $limit: Int){
    collection(userId: $userId, skip: $skip, limit: $limit){
      id
      title
    }
  }
`
export const GetRootCategoriesQuery = gql`
  query GetRootCategories {
    rootCategories{
      id
      label
    }
  }
`
export const GetChildrenCategoriesQuery = gql`
  query GetChildrenCategories($id: ID!) {
    childrenCategories(id: $id) {
      id
      label
    }
  }
`
export const GetBooksQuery = gql`
  query GetBooks($skip: Int!, $limit: Int!, $filter: BooksFilter) {
    booksFiltered(skip: $skip, limit: $limit, filter: $filter) {
      id
      title
      volume
      authors
      publisher
      picture{
        file
      }
    }
  }
`
export const BooksCountQuery = gql`
  query BooksCount($filter: BooksFilter) {
    bookCount(filter: $filter) 
  }
`
export const GetPopularAuthorsQuery = gql`
  query GetPopularAuthors($category: String!){
    popularAuthors(category: $category) 
  }
`
export const GetPublishersQuery = gql`
  query GetPublishers($category: String!){
    publishers(category: $category)
  }
`
export const GetChildrenByPathQuery = gql`
  query GetChildrenByPath($path: String!){
    childrenByPath(path: $path){
      id
      label
    }
  }
`
export const GetBookById = gql`
  query GetBookById($id: ID!) {
    book(id: $id){
      isbn
      title
      authors
      translators
      publisher
      summary
      pubDate
      version
      category
      count
      location
      price
      volume
      picture {
        file
      }
    }
  }
`
export const GetBookCoverById = gql`
  query GetBookCoverBy($id: ID!) {
    book(id: $id){
      picture {
        file
      }
    }
  }
`
export const GetBookCommentsProfileQuery = gql`
  query GetBookCommentsProfile($bookId: String!){
    bookCommentsProfile(bookId: $bookId){
      count
      average
      max
      group{
        level
        percent
      }
    }
  }
`
export const GetBookCommentsQuery = gql`
  query GetBookComments($skip: Int!, $limit: Int!, $bookId: String!){
    bookComments(skip: $skip, limit: $limit, bookId: $bookId){
      id
      details
      title
      thumbs
      score
      postDate
      userId
      user{
        photo{
          file
        }
        username
      }
    }
  }
`
export const HasUserCommentedForTheBookQuery = gql`
  query HasUserCommentedForTheBook($userId: String!, $bookId: String!){
    hasUserCommented(userId: $userId, bookId: $bookId)
  }
`
export const GetCartCountQuery = gql`
  query GetCartCount{
    cartCount
  }
`
export const GetBooksInCartQuery = gql`
  query GetBooksInCart{
    booksInCart{
      id
      isbn
      title
      authors
      count
      scheduledCount
      category
      location
      picture{
        file
      }
    }
  }
`
export const GetBooksInPlanQuery = gql`
  query GetBooksInPlan($userId: String, $kind: ReserveKind!){
    booksInPlan(userId: $userId, kind: $kind){
      expireAt
      books{
        id
        title
        authors
        category
        location
        picture{
          file
        }
      }
    }
  }
`
export const GetSubsInCartQuery = gql`
  query GetSubsInCart{
    subsInCart{
      isbn
      title
      picture{
        file
      }
      count
      scheduledCount
    }
  }
`
export const GetFriendsQuery = gql`
  query GetFriends($skip: Int!,$limit: Int!){
    getFriends(skip: $skip, limit: $limit){
      group
      friends{
        id
        username
        photo{
          file
        }
      }
    }
  }
`
export const GetUserByIDQuery = gql`
  query GetUserByID($id: ID!){
    user(id: $id){
      id
      username
      photo{
        file
      }
    }
  }
`
export const GetSessionQuery = gql`
  query GetSession($participators: [ID!]!){
    getSession(participators: $participators)
  }
`
export const GetGroupedPostsQuery = gql`
  query GetGroupedPosts($sessionId: ID!, $skip: Int!, $limit: Int!){
    posts(sessionId: $sessionId, skip: $skip, limit: $limit){
      iat
      posts{
        id
        postBy
        message
        book{
          id
          title
          summary
          picture{
            file
          }
        }
        status{
          receiver
          unread
        }
      }
    }
  }
`
export const GetUserByNameOrEmailQuery = gql`
  query GetUserByNameOrEmail($search: String!){
    userByNameOrEmail(search: $search){
      friend{
         id
         username
         department
         photo{
           file
         }
      } 
      status
    }
  }
`
export const GetUnhandledFriendshipQuery = gql`
  query GetUnhandledFriendship{
    unHandledFriendship{
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
export const GetReadPlansQuery = gql`
  query GetReadPlans{
    readPlans{
      id
      title
      plans{
        book{
          id
          title
        }
        process
        timespan
      }
    }
  }
`
export const GetInterestsQuery = gql`
  query GetInterests{
    interests{
      category
      percent
      count
    }
  }
`
export const GetMostBorrowedQuery = gql`
  query GetMostBorrowed($skip: Int!, $limit: Int!){
     mostBorrowed(skip: $skip, limit: $limit){
       count
       book{
         id
         title
         picture{
           file
         }
       }
     }
  }
`
export const GetMostCollectedQuery = gql`
  query GetMostCollected($skip: Int!, $limit: Int!){
     mostCollected(skip: $skip, limit: $limit){
       count
       book{
         id
         title
         picture{
           file
         }
       }
     }
  }
`
export const GetMostRecommandedQuery = gql`
  query GetMostRecommanded($skip: Int!, $limit: Int!){
     mostRecommanded(skip: $skip, limit: $limit){
       count
       book{
         id
         title
         picture{
           file
         }
       }
     }
  }
`
