<template>
  <div class="h-100 overflow-hidden">
    <sticky class="bg-gradient">
      <x-header :left-options="{backText: ''}">
        <router-link to="/" tag="div" class="relative logo ml-auto mr-auto" slot="overwrite-title">
          <img src="../assets/logo.png" class="w-100">
          <div class="f5 lh-solid absolute left-0">图书馆</div>
        </router-link>
        <router-link tag="div" to="/books/cart/view" class="w2 tc cart" slot="right">
          <i class="iconfont vux-icon-lib-shop-cart- relative">
            <span class="red absolute f6 lh-solid top-0">{{cartCount}}</span>
          </i>
        </router-link>
      </x-header>
    </sticky>
    <router-view></router-view>
  </div>
</template>

<script>
  import { XHeader, Sticky } from 'vux'
  import { GetCartCountQuery } from '../constants/graphql-queries'

  export default {
    name: 'book-layout',
    data () {
      return {
        cartCount: 0
      }
    },
    apollo: {
      cartCount: { query: GetCartCountQuery }
    },
    components: {
      XHeader,
      Sticky
    }
  }
</script>

<style scoped>
  .bg-gradient >>> .vux-header{
    background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(244,244,244,1) 100%);
    background: -moz-linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(244,244,244,1) 100%);
    background: -webkit-linear-gradient(to bottom, rgba(255,255,255,1) 0%,rgba(244,244,244,1) 100%);
  }
  .logo{
    width: 50px;
  }
  .logo > img{
    height: 1.5rem;
  }
  .logo > div{
    top: 1.5rem;
  }
  .cart > i{
    font-size: 1.5rem;
    color: black;
  }
  .cart > i > span{
    left: 10px;
  }
</style>
