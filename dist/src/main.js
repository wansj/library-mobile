// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import FastClick from 'fastclick';
import VueRouter from 'vue-router';
import VueApollo from 'vue-apollo';
import { TransferDom, InlineLoading, AlertPlugin, ToastPlugin, LoadingPlugin } from 'vux';
import 'tachyons';
import './assets/icon/iconfont.css';
import App from './App';
import router from './router';
import apolloClient from './ApolloClient';

Vue.use(VueRouter);
Vue.use(VueApollo);
Vue.use(AlertPlugin);
Vue.use(LoadingPlugin);
Vue.use(ToastPlugin);

Vue.directive('transfer-dom', TransferDom);
Vue.component('inline-loading', InlineLoading);

FastClick.attach(document.body);

Vue.config.productionTip = false;

var apolloProvider = new VueApollo({
  defaultClient: apolloClient
});

/* eslint-disable no-new */
new Vue({
  router: router,
  provide: apolloProvider.provide(),
  render: function render(h) {
    return h(App);
  }
}).$mount('#app-box');
//# sourceMappingURL=main.js.map