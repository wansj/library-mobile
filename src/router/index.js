import Vue from 'vue'
import Router from 'vue-router'
import { isLoged } from '../utils'
import apolloClient from '../ApolloClient'
import { UpdateLoadingStatusMutation } from '../store/LoadingStatus'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/signin',
      component: () => import('@/components/SignIn.vue').then(m => m.default)
    },
    {
      path: '/reset-password',
      component: () => import('@/components/Resetpassword.vue').then(m => m.default)
    },
    {
      path: '/signup',
      component: () => import('@/components/SignUp.vue').then(m => m.default)
    },
    {
      path: '/',
      component: () => import('@/components/MainLayout.vue').then(m => m.default),
      meta: { requireAuth: true },
      children: [{
        path: '',
        component: () => import('@/components/Home.vue').then(m => m.default)
      }, {
        path: 'categories',
        component: () => import('@/components/CategoryLayout.vue').then(m => m.default)
      }, {
        path: 'me',
        component: () => import('@/components/Me.vue').then(m => m.default)
      }]
    },
    {
      path: '/books',
      meta: { requireAuth: true },
      component: () => import('@/components/BookLayout.vue').then(m => m.default),
      children: [{
        path: ':id',
        component: () => import('@/components/BookDetails.vue').then(m => m.default),
        props: (route) => ({id: route.params.id})
      }, {
        path: 'comments/view',
        component: () => import('@/components/CommentsView.vue').then(m => m.default),
        props: (route) => ({bookId: route.query.bookId, userId: route.query.userId})
      }, {
        path: 'comments/:id',
        component: () => import('@/components/CommentsDetail.vue').then(m => m.default),
        props: (route) => ({id: route.params.id, skip: route.query.skip, limit: route.query.limit, bookId: route.query.bookId})
      }, {
        path: 'cart/view',
        component: () => import('@/components/BookCart.vue').then(m => m.default)
      }]
    },
    {
      path: '/books/:id/comments/post',
      meta: { requireAuth: true },
      component: () => import('@/components/PostComment.vue').then(m => m.default),
      props: (route) => ({bookId: route.params.id, userId: route.query.userId})
    },
    {
      path: '/user',
      meta: { requireAuth: true },
      component: () => import('@/components/UserDetails.vue').then(m => m.default)
    },
    {
      path: '/editUser',
      meta: { requireAuth: true },
      component: () => import('@/components/EditUser.vue').then(m => m.default),
      props: (route) => ({field: route.query.field, value: route.query.value, id: route.query.id})
    },
    {
      path: '/history',
      meta: { requireAuth: true },
      component: () => import('@/components/BorrowHistory.vue').then(m => m.default)
    },
    {
      path: '/collection',
      meta: { requireAuth: true },
      component: () => import('@/components/UserCollection.vue').then(m => m.default)
    },
    {
      path: '/search',
      meta: { requireAuth: true },
      component: () => import('@/components/SearchPage.vue').then(m => m.default),
      props: (route) => ({category: route.query.category})
    },
    {
      path: '/borrow-plan',
      meta: { requireAuth: true },
      component: () => import('@/components/BorrowPlan.vue').then(m => m.default)
    },
    {
      path: '/return-plan',
      meta: { requireAuth: true },
      component: () => import('@/components/ReturnPlan.vue').then(m => m.default)
    },
    {
      path: '/my-plan',
      meta: { requireAuth: true },
      component: () => import('@/components/MyPlan.vue').then(m => m.default)
    },
    {
      path: '/my-interests',
      meta: { requireAuth: true },
      component: () => import('@/components/MyInterests.vue').then(m => m.default)
    },
    {
      path: '/friends',
      meta: { requireAuth: true },
      component: () => import('@/components/Friends.vue').then(m => m.default)
    },
    {
      path: '/addFriend',
      meta: { requireAuth: true },
      component: () => import('@/components/AddFriend.vue').then(m => m.default)
    },
    {
      path: '/validateFriend',
      meta: { requireAuth: true },
      component: () => import('@/components/ValidateFriend.vue').then(m => m.default),
      props: (route) => ({friendId: route.query.friendId})
    },
    {
      path: '/talk/:friend',
      meta: { requireAuth: true },
      component: () => import('@/components/Talk.vue').then(m => m.default),
      props: (route) => ({friendId: route.params.friend, sessionId: route.query.sessionId})
    },
    {
      path: '/share/:friend',
      meta: { requireAuth: true },
      component: () => import('@/components/ShareBook.vue').then(m => m.default),
      props: (route) => ({friendId: route.params.friend, sessionId: route.query.sessionId, source: route.query.source})
    },
    {
      path: '/notifications',
      meta: { requireAuth: true },
      component: () => import('@/components/Notifications.vue').then(m => m.default)
    },
    {
      path: '/settings',
      meta: { requireAuth: true },
      component: () => import('@/components/Settings.vue').then(m => m.default)
    },
    {
      path: '/privacy',
      component: () => import('@/components/Privacy.vue').then(m => m.default)
    },
    {
      path: '/aboutMe',
      component: () => import('@/components/AboutMe.vue').then(m => m.default)
    },
    {
      path: '/feedback',
      meta: { requireAuth: true },
      component: () => import('@/components/Feedback.vue').then(m => m.default)
    }
  ]
})
router.beforeEach(async (to, from, next) => {
  apolloClient.mutate({
    mutation: UpdateLoadingStatusMutation,
    variables: { loading: true }
  })
  if (to.matched.some(record => record.meta.requireAuth)) {
    const loged = await isLoged()
    // console.log(token)
    if (!loged) {
      next({
        path: '/signin'
      })
    } else {
      next()
    }
  } else {
    next()
  }
})
router.afterEach(function (to) {
  apolloClient.mutate({
    mutation: UpdateLoadingStatusMutation,
    variables: { loading: false }
  })
})
export default router
