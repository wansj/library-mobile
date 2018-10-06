<template>
  <div class="scroll-container">
    <group>
      <cell link="/user" v-if="logedUser" :title="logedUser.username">
        <span slot="inline-desc" class="mt0">{{departDesc}}</span>
        <img :src="recoverPicture()" slot="icon" class="w3 h3 mr3">
      </cell>
      <cell title="点击登录" link="/signin" v-else>
        <i class="iconfont vux-icon-lib-avatar" slot="icon"></i>
        <inline-loading v-if="$apollo.queries.logedUser.loading"></inline-loading>
      </cell>
    </group>
    <group>
      <cell title="借书预约" link="/borrow-plan">
        <i class="iconfont vux-icon-lib-jiebei mr2" slot="icon"></i>
      </cell>
      <cell title="还书预约" link="/return-plan">
        <i class="iconfont vux-icon-lib-huanzhong mr2" slot="icon"></i>
      </cell>
    </group>
    <group class="no-bb">
      <cell title="我的书友" link="/friends">
        <i class="iconfont vux-icon-lib-friends blue mr2" slot="icon"></i>
      </cell>
      <cell title="读书计划" link="/my-plan">
        <i class="iconfont vux-icon-lib-jihua mr2" slot="icon"></i>
      </cell>
      <cell title="我的兴趣" link="/my-interests">
        <i class="iconfont vux-icon-lib-heart red mr2" slot="icon"></i>
      </cell>
      <cell title="我的收藏" link="/collection">
        <i class="iconfont vux-icon-lib-shoucang yellow mr2" slot="icon"></i>
      </cell>
      <cell title="阅读历史" link="/history">
        <i class="iconfont vux-icon-lib-history green mr2" slot="icon"></i>
        <inline-loading v-if="$apollo.queries.logedUser.loading"></inline-loading>
      </cell>
    </group>
    <div class="overflow-x-auto w-100 bg-white ph3" v-if="logedUser">
      <table class="w-100" cellpadding="0" cellspacing="0" style="table-layout:fixed">
        <tr>
          <td v-for="record in logedUser.statistics.recentRead" :key="record.book.id" width="90" class="v-top">
            <router-link :to="{path: `/books/${record.book.id}`}">
              <img :src="cover(record.book.picture.file)" class="w3 h3">
              <div>{{record.book.title}}</div>
            </router-link>
          </td>
        </tr>
      </table>
    </div>
    <group>
      <cell title="消息通知" link="/notifications">
        <i class="iconfont vux-icon-lib-notice blue mr2" slot="icon"></i>
        <inline-loading v-if="$apollo.queries.unHandledFriendship.loading||$apollo.queries.subsInCart.loading"></inline-loading>
        <template v-else-if="unHandledFriendship && subsInCart">
          <badge v-if="showNewMessage"></badge>
        </template>
      </cell>
      <cell title="设置" link="/settings">
        <i class="iconfont vux-icon-lib-settings blue mr2" slot="icon"></i>
      </cell>
    </group>
  </div>
</template>

<script>
  import { Flexbox, FlexboxItem, Group, Cell, Badge } from 'vux'
  import { GetLogedUserQuery, GetSubsInCartQuery, GetUnhandledFriendshipQuery } from '../constants/graphql-queries'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'me',
    data () {
      return {
        logedUser: null,
        imgMap: new Map(),
        subsInCart: null,
        unHandledFriendship: null
      }
    },
    apollo: {
      subsInCart: {
        query: GetSubsInCartQuery,
        fetchPolicy: 'no-cache',
        error (error) {
          this.$vux.alert.show({
            title: '出错了',
            content: error.message
          })
        }
      },
      unHandledFriendship: {
        query: GetUnhandledFriendshipQuery,
        fetchPolicy: 'no-cache',
        error (error) {
          this.$vux.alert.show({
            title: '出错了',
            content: error.message
          })
        }
      },
      logedUser: {
        query: GetLogedUserQuery,
        error (error) {
          this.$vux.alert.show({
            title: '出错了',
            content: error.message
          })
        }
      }
    },
    computed: {
      showNewMessage: function () {
        const bookNoty = this.subsInCart.some(({count, scheduledCount}) => count > scheduledCount)
        const friendNoty = this.unHandledFriendship.length > 0
        return bookNoty || friendNoty
      },
      departDesc: function () {
        return `单位: ${this.logedUser.department}`
      },
      username: function () {
        return this.logedUser.username
      }
    },
    components: {
      Flexbox,
      FlexboxItem,
      Group,
      Cell,
      Badge
    },
    methods: {
      recoverPicture () {
        if (this.logedUser && this.logedUser.photo && this.logedUser.photo.file) {
          if (this.imgMap.has(this.logedUser)) return this.imgMap.get(this.logedUser)
          else {
            const url = transformUploadToURL(this.logedUser.photo.file)
            this.imgMap.set(this.logedUser, url)
            return url
          }
        }
        return require('../assets/me.png')
      },
      cover (upload) {
        return transformUploadToURL(upload)
      }
    }
  }
</script>

<style scoped>
  .no-bb >>> .weui-cells:after{
    border-bottom: none;
  }
  .iconfont.vux-icon-lib-avatar{
    font-size: 48px;
    margin-right: .5rem;
  }
  .scroll-container{
    overflow-y: auto;
    height: calc(100% - 53px);
  }
</style>
