import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';

var _this = this;

import Vue from 'vue';
import Router from 'vue-router';
import { isLoged } from '../utils';
import apolloClient from '../ApolloClient';
import { UpdateLoadingStatusMutation } from '../store/LoadingStatus';

Vue.use(Router);

var router = new Router({
  mode: 'history',
  routes: [{
    path: '/signin',
    component: function component() {
      return import('@/components/SignIn.vue').then(function (m) {
        return m.default;
      });
    }
  }, {
    path: '/reset-password',
    component: function component() {
      return import('@/components/Resetpassword.vue').then(function (m) {
        return m.default;
      });
    }
  }, {
    path: '/signup',
    component: function component() {
      return import('@/components/SignUp.vue').then(function (m) {
        return m.default;
      });
    }
  }, {
    path: '/',
    component: function component() {
      return import('@/components/MainLayout.vue').then(function (m) {
        return m.default;
      });
    },
    meta: { requireAuth: true },
    children: [{
      path: '',
      component: function component() {
        return import('@/components/Home.vue').then(function (m) {
          return m.default;
        });
      }
    }, {
      path: 'categories',
      component: function component() {
        return import('@/components/CategoryLayout.vue').then(function (m) {
          return m.default;
        });
      }
    }, {
      path: 'me',
      component: function component() {
        return import('@/components/Me.vue').then(function (m) {
          return m.default;
        });
      }
    }]
  }, {
    path: '/books',
    meta: { requireAuth: true },
    component: function component() {
      return import('@/components/BookLayout.vue').then(function (m) {
        return m.default;
      });
    },
    children: [{
      path: ':id',
      component: function component() {
        return import('@/components/BookDetails.vue').then(function (m) {
          return m.default;
        });
      },
      props: function props(route) {
        return { id: route.params.id };
      }
    }, {
      path: 'comments/view',
      component: function component() {
        return import('@/components/CommentsView.vue').then(function (m) {
          return m.default;
        });
      },
      props: function props(route) {
        return { bookId: route.query.bookId, userId: route.query.userId };
      }
    }, {
      path: 'comments/:id',
      component: function component() {
        return import('@/components/CommentsDetail.vue').then(function (m) {
          return m.default;
        });
      },
      props: function props(route) {
        return { id: route.params.id, skip: route.query.skip, limit: route.query.limit, bookId: route.query.bookId };
      }
    }, {
      path: 'cart/view',
      component: function component() {
        return import('@/components/BookCart.vue').then(function (m) {
          return m.default;
        });
      }
    }]
  }, {
    path: '/books/:id/comments/post',
    component: function component() {
      return import('@/components/PostComment.vue').then(function (m) {
        return m.default;
      });
    },
    props: function props(route) {
      return { bookId: route.params.id, userId: route.query.userId };
    }
  }, {
    path: '/user',
    meta: { requireAuth: true },
    component: function component() {
      return import('@/components/UserDetails.vue').then(function (m) {
        return m.default;
      });
    }
  }, {
    path: '/editUser',
    meta: { requireAuth: true },
    component: function component() {
      return import('@/components/EditUser.vue').then(function (m) {
        return m.default;
      });
    },
    props: function props(route) {
      return { field: route.query.field, value: route.query.value, id: route.query.id };
    }
  }, {
    path: '/history',
    meta: { requireAuth: true },
    component: function component() {
      return import('@/components/BorrowHistory.vue').then(function (m) {
        return m.default;
      });
    },
    props: function props(route) {
      return { userId: route.query.userId };
    }
  }, {
    path: '/collection',
    meta: { requireAuth: true },
    component: function component() {
      return import('@/components/UserCollection.vue').then(function (m) {
        return m.default;
      });
    },
    props: function props(route) {
      return { userId: route.query.userId };
    }
  }, {
    path: '/search',
    meta: { requireAuth: true },
    component: function component() {
      return import('@/components/SearchPage.vue').then(function (m) {
        return m.default;
      });
    },
    props: function props(route) {
      return { category: route.query.category };
    }
  }, {
    path: '/borrow-plan',
    meta: { requireAuth: true },
    component: function component() {
      return import('@/components/BorrowPlan.vue').then(function (m) {
        return m.default;
      });
    }
  }, {
    path: '/friends',
    component: function component() {
      return import('@/components/Friends.vue').then(function (m) {
        return m.default;
      });
    }
  }]
});
router.beforeEach(function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(to, from, next) {
    var loged;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            apolloClient.mutate({
              mutation: UpdateLoadingStatusMutation,
              variables: { loading: true }
            });

            if (!to.matched.some(function (record) {
              return record.meta.requireAuth;
            })) {
              _context.next = 8;
              break;
            }

            _context.next = 4;
            return isLoged();

          case 4:
            loged = _context.sent;

            // console.log(token)
            if (!loged) {
              next({
                path: '/signin'
              });
            } else {
              next();
            }
            _context.next = 9;
            break;

          case 8:
            next();

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
router.afterEach(function (to) {
  apolloClient.mutate({
    mutation: UpdateLoadingStatusMutation,
    variables: { loading: false }
  });
});
export default router;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map