import _regeneratorRuntime from 'babel-runtime/regenerator';
import _asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import _Promise from 'babel-runtime/core-js/promise';

var _this = this;

import JSEncrypt from 'jsencrypt';
import iconv from 'iconv-lite';
import { dateFormat } from 'vux';
import { G_AUTH_TOKEN } from './constants/settings';
import { GetAuthPayloadQuery } from './store/AuthPayload';
import apolloClient from './ApolloClient';
// import { GetLogedUserQuery } from './constants/graphql-queries'

// 如果用是否存在token作为标准判断用户是否已登录，由于刷新页面Apollo缓存会消失，存储在AuthPayload里的token会消失，直接返回AuthPayload里的token会导致
// 需要重新登录，如果返回记录在localStorage里的token,由于localStorage没有过期时间，而服务器端则规定了token的有效期，在token过期以后使用localStorage
// 里的token会导致jwt expired的错误。所以除非使用Cookie代替localStorage，而Cookie和localStorage浏览器不是完全支持的
// 如果专门写一个isLoged的方法，通过GetLogedUserQuery去请求服务器端用户的登录状态又会导致一次不必要的请求（用户在登录页面已经登录过了，在跳转到具体页面
// 时又会被路由钩子函数拦截，再次判断登录状态）
export var getToken = function getToken() {
  try {
    var _apolloClient$readQue = apolloClient.readQuery({ query: GetAuthPayloadQuery }),
        authPayload = _apolloClient$readQue.data.authPayload;

    return authPayload.token || localStorage.getItem(G_AUTH_TOKEN);
  } catch (e) {
    return localStorage.getItem(G_AUTH_TOKEN);
  }
};
// 如果Apollo缓存中的token已经存在，说明用户已登录，直接返回true，否则再判断localStorage中记录的token是否已过期
export var isLoged = function isLoged() {
  return new _Promise(function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(resolve, reject) {
      var _ref2, authPayload;

      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return apolloClient.query({ query: GetAuthPayloadQuery });

            case 3:
              _ref2 = _context.sent;
              authPayload = _ref2.data.authPayload;

              if (authPayload.token) resolve(true);else {
                resolve(localStorage.getItem(G_AUTH_TOKEN));
                // const {data: {logedUser}} = await apolloClient.query({
                //   query: GetLogedUserQuery
                // })
                // resolve(logedUser.loged)
              }
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context['catch'](0);

              resolve(false);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[0, 8]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};
export var encryptPassword = function encryptPassword(password, publicKey) {
  var encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  var encrypted = encrypt.encrypt(password);
  return encrypted;
};
export var transformUploadToURL = function transformUploadToURL(upload) {
  var content = iconv.encode(upload.stream, 'base64');
  return URL.createObjectURL(new Blob([content]));
};
export var formatDate = function formatDate(date) {
  if (!(date instanceof Date)) throw new Error('date必须是日期格式');
  var hour = date.getHours();
  var str = '';
  if (hour >= 2 && hour < 5) str = '凌晨';else if (hour >= 5 && hour < 8) str = '早晨';else if (hour >= 8 && hour < 12) str = '上午';else if (hour >= 12 && hour < 14) str = '中午';else if (hour >= 14 && hour < 18) str = '下午';else if (hour >= 18 && hour < 22) str = '晚上';else str = '深夜';
  return dateFormat(date, 'YYYY\u5E74MM\u6708DD\u65E5 ' + str + 'HH:mm');
};
//# sourceMappingURL=utils.js.map