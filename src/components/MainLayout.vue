<template>
  <div class="h-100 overflow-hidden">
    <transition :name="transitionName" mode="out-in">
      <router-view></router-view>
    </transition>
    <tabbar @on-index-change="tabChanged">
      <tabbar-item selected link="/">
        <img slot="icon" src="../assets/home.png">
        <span slot="label">主页</span>
      </tabbar-item>
      <tabbar-item link="/categories">
        <img slot="icon" src="../assets/books.png">
        <span slot="label">图书</span>
      </tabbar-item>
      <tabbar-item link="/books/cart/view" :badge="badge">
        <img slot="icon" src="../assets/list.png">
        <span slot="label">书单</span>
      </tabbar-item>
      <tabbar-item link="/me">
        <img slot="icon" src="../assets/me.png">
        <span slot="label">我的</span>
      </tabbar-item>
    </tabbar>
  </div>
</template>

<script>
import { Tabbar, TabbarItem } from 'vux'
import { GetCartCountQuery } from '../constants/graphql-queries'

export default {
  components: {
    Tabbar,
    TabbarItem
  },
  data () {
    return {
      transitionName: 'slide-right',
      cartCount: 0
    }
  },
  computed: {
    badge: function () {
      return this.cartCount ? `${this.cartCount}` : ''
    }
  },
  apollo: {
    cartCount: {
      query: GetCartCountQuery,
      error (error) {
        this.$vux.alert.show({
          title: '出错了',
          content: error.message
        })
      }
    }
  },
  methods: {
    tabChanged (val, oldVal) {
      if (val < oldVal) this.transitionName = 'slide-right'
      else this.transitionName = 'slide-left'
    }
  }
}
</script>

<style scoped>
  .slide-right-enter{
    transform: translateX(-20px);
    opacity: 0;
  }
  .slide-right-leave-to{
    transform: translateX(20px);
    opacity: 0;
  }
  .slide-right-enter-active, .slide-right-leave-active{
    transition: all .3s ease;
  }
  .slide-left-enter{
    transform: translateX(20px);
    opacity: 0;
  }
  .slide-left-leave-to{
    transform: translateX(-20px);
    opacity: 0;
  }
  .slide-left-enter-active, .slide-left-leave-active{
    transition: all .3s ease;
  }
</style>
