<template>
  <div>
    <x-header title="通知和消息"></x-header>
    <group title="您关注的下列图书现在有货哦">
      <p class="tc" v-if="$apollo.queries.subsInCart.loading">
        <span class="v-mid f6 dib">加载中&nbsp;&nbsp;</span><inline-loading></inline-loading>
      </p>
      <swipeout v-else-if="subsInCart.length">
        <swipeout-item transition-mode="follow" v-for="book in subsInCart" :key="book.isbn">
          <div slot="right-menu">
            <swipeout-button @click.native="unsubscibe(book.isbn)" type="primary">知道了</swipeout-button>
          </div>
          <div slot="content" class="pa2 vux-1px-t flex items-center">
            <img :src="recoverPicture(book.picture)" class="w2 h2">
            <div class="ml2">{{book.title}}</div>
          </div>
        </swipeout-item>
      </swipeout>
      <cell v-else><div slot="child" class="w-100 tc silver">暂无消息</div></cell>
    </group>
    <group title="好友验证消息">
      <p class="tc" v-if="$apollo.queries.unHandledFriendship.loading">
        <span class="v-mid f6 dib">加载中&nbsp;&nbsp;</span><inline-loading></inline-loading>
      </p>
      <cell v-else-if="unHandledFriendship.length" v-for="friend in unHandledFriendship" :key="friend.id">
        <img slot="icon" :src="recoverPicture(friend.initiator.photo)" class="w3 h3">
        <span slot="title" class="pl2">{{friend.initiator.username}}</span>
        <span slot="inline-desc" class="pl2">{{friend.validateMessage}}</span>
        <x-button mini type="primary" @click.native="approveFriendship(friend.id)">同意</x-button>
      </cell>
      <cell v-else><div slot="child" class="w-100 tc silver">暂无消息</div></cell>
    </group>
    <div v-transfer-dom>
      <alert v-model="showAlert" :title="altTitle" :content="altContent"></alert>
    </div>
  </div>
</template>

<script>
  import { XHeader, Group, Cell, Swipeout, SwipeoutItem, SwipeoutButton, XButton, Alert } from 'vux'
  import { GetSubsInCartQuery, GetUnhandledFriendshipQuery, GetLogedUserQuery } from '../constants/graphql-queries'
  import { RemoveFromSubMutation, ApproveFriendshipMutation } from '../constants/graphql-mutations'
  import { FriendAddedSubscription } from '../constants/graphql-subscriptions'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'notifications',
    data () {
      return {
        logedUser: null,
        subsInCart: [],
        unHandledFriendship: [],
        showAlert: false,
        altTitle: '',
        altContent: '',
        imgMap: new Map()
      }
    },
    methods: {
      approveFriendship (id) {
        this.$apollo.mutate({
          mutation: ApproveFriendshipMutation,
          variables: { id },
          refetchQueries: [{query: GetUnhandledFriendshipQuery}]
        }).then(() => {
          this.showAlert = true
          this.altTitle = '恭喜'
          this.altContent = '你们已经成为朋友了'
        }).catch(e => {
          this.showAlert = true
          this.altTitle = '出错了'
          this.altContent = e.message
        })
      },
      unsubscibe (isbn) {
        this.$apollo.mutate({
          mutation: RemoveFromSubMutation,
          variables: { isbn },
          refetchQueries: [{
            query: GetSubsInCartQuery
          }]
        }).catch(e => {
          this.showAlert = true
          this.altTitle = '出错了'
          this.altContent = e.message
        })
      },
      recoverPicture (pic) {
        if (pic && pic.file) {
          if (this.imgMap.has(pic.file)) return this.imgMap.get(pic.file)
          else {
            const url = transformUploadToURL(pic.file)
            this.imgMap.set(pic.file, url)
            return url
          }
        }
        return require('../assets/nophoto.gif')
      }
    },
    apollo: {
      logedUser: { query: GetLogedUserQuery },
      subsInCart: {
        query: GetSubsInCartQuery
      },
      unHandledFriendship: {
        query: GetUnhandledFriendshipQuery
      },
      $subscribe: {
        friendAdded: {
          query: FriendAddedSubscription,
          variables () {
            return { userId: this.logedUser.id }
          },
          result ({data}) {
            const contains = this.unHandledFriendship.findIndex(({id}) => id === data.friendAdded.id) > -1
            if (!contains) this.unHandledFriendship = [...this.unHandledFriendship, data.friendAdded]
          }
        }
      }
    },
    components: { XHeader, Group, Cell, Swipeout, SwipeoutItem, SwipeoutButton, XButton, Alert }
  }
</script>

<style scoped>
</style>
