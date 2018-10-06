<template>
  <div class="h-100 bg-white relative">
    <x-header title="我的书友" class="cus-x-icon">
      <x-icon type="ios-plus-empty" size="30" slot="right" @click.native="showDropdown=!showDropdown"></x-icon>
    </x-header>
    <group v-if="showDropdown" class="dropdown-menu">
      <cell title="添加朋友" @click.native="$router.push('/addFriend')">
        <i slot="icon" class="iconfont vux-icon-lib-adduser mr2"></i>
      </cell>
    </group>
    <p class="tc" v-if="$apollo.queries.getFriends.loading">
      <span class="v-mid dib f6">加载中&nbsp;&nbsp;</span><inline-loading></inline-loading>
    </p>
    <index-list v-else-if="getFriends">
      <index-section :index="item.group" v-for="item in getFriends" :key="item.group">
        <cell :title="friend.username" v-for="friend in item.friends" :key="friend.id" @click.native="talkTo(friend)">
          <img :src="recoverPicture(friend.photo)" class="w2 h2 mr2" slot="icon">
        </cell>
      </index-section>
    </index-list>
    <div v-else class="pt6 tc">您还没有书友，快去添加一个吧！</div>
  </div>
</template>

<script>
  import { Group, Cell, XHeader } from 'vux'
  import { GetFriendsQuery, GetSessionQuery } from '../constants/graphql-queries'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'friends',
    data () {
      return {
        skip: 0,
        limit: 30,
        getFriends: null,
        showDropdown: false,
        imgMap: new Map()
      }
    },
    components: {
      Group,
      Cell,
      XHeader,
      'index-list': () => import('./IndexList.vue').then(m => m.default),
      'index-section': () => import('./IndexSection.vue').then(m => m.default)
    },
    apollo: {
      getFriends: {
        query: GetFriendsQuery,
        variables () {
          return { skip: this.skip, limit: this.limit }
        }
      }
    },
    methods: {
      recoverPicture (pic) {
        if (pic && pic.file) {
          if (this.imgMap.has(pic.file)) return this.imgMap.get(pic.file)
          else {
            const url = transformUploadToURL(pic.file)
            this.imgMap.set(pic.file, url)
            return url
          }
        }
        return require('../assets/me.png')
      },
      async talkTo (friend) {
        try {
          const {data: {getSession}} = await this.$apollo.query({
            query: GetSessionQuery,
            variables: {participators: [friend.id]}
          })
          this.$router.push(`/talk/${friend.id}?sessionId=${getSession}`)
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
</script>

<style scoped>
  .vux-x-icon {
    fill: white;
  }
  .cus-x-icon >>> .vux-header-right{
    top: .5rem;
  }
  .weui-cell{
    padding-left: 10px;
    padding-right: 10px;
    background-color: white;
  }
  .dropdown-menu{
    position: absolute;
    right: 1rem;
    top: 46px;
    z-index: 999;
  }
  .dropdown-menu >>> .weui-cells{
    margin-top: 0;
  }
  .dropdown-menu .weui-cell{
    background-color: rgb(53,73,94);
    color: white;
  }
</style>
