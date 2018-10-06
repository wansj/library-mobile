<template>
  <div class="h-100">
    <x-header title="推荐好书给朋友"></x-header>
    <div class="overflow-container h-strech" infinite-wrapper>
      <panel type="5" :list="list" @on-click-item="showDlg"></panel>
      <infinite-loading @infinite="loadMore" @$InfiniteLoading:complete="allLoaded" force-use-infinite-wrapper>
        <span slot="no-results">
          <msg title="没有数据" description="空空如也是一种态度" icon="info"></msg>
        </span>
        <span slot="no-more"></span>
      </infinite-loading>
    </div>
    <div v-transfer-dom>
      <x-dialog v-model="showShareDlg" @on-show="onDlgShow">
        <div class="pa3">
          <h3 class="tl normal">推荐给：</h3>
          <div class="flex items-center mv3">
            <template v-if="$apollo.queries.user.loading">
              <div class="w3 h3 bg-light-gray flex-none"></div>
              <div class="flex-auto bg-light-gray"></div>
            </template>
            <template v-else-if="friend">
              <!--<img class="avatar flex-none mr1" :src="recoverPicture(friend.photo)">-->
              <img class="avatar flex-none mr1" src="../assets/me.png">
              <div class="flex-auto tl">{{friend.username}}</div>
            </template>
          </div>
          <router-link tag="div" :to="link" class="bg-light-gray pa2 flex items-center" v-if="clickedItem">
            <img class="w2 h2 flex-none mr1" :src="clickedItem.src">
            <span class="flex-auto tl silver">{{clickedItem.title}}</span>
          </router-link>
          <group class="no-bt">
            <x-textarea v-model="message" :rows="1" autosize placeholder="给朋友留言" :show-counter="false" class="vux-1px-b-active" ref="textarea"></x-textarea>
          </group>
          <div class="tr mt3">
            <span class="mr4" @click="hideDlg">取消</span>
            <span class="mr1 green" @click="sendMessage">发送</span>
          </div>
        </div>
      </x-dialog>
    </div>
  </div>
</template>

<script>
  import { XHeader, XDialog, XTextarea, Panel, Group, Msg } from 'vux'
  import InfiniteLoading from 'vue-infinite-loading'
  import { GetCollectionQuery, GetRecordsQuery, GetLogedUserQuery, GetUserByIDQuery, GetGroupedPostsQuery } from '../constants/graphql-queries'
  import { AddPostMutation } from '../constants/graphql-mutations'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'share-book',
    components: { XHeader, XDialog, XTextarea, Panel, Group, InfiniteLoading, Msg },
    data () {
      return {
        skip: 0,
        limit: 5,
        books: [],
        logedUser: null,
        showShareDlg: false,
        friend: null,
        clickedItem: null,
        message: '',
        loading: false,
        imgMap: new Map()
      }
    },
    methods: {
      allLoaded () {
        if (this.books.length > 0) this.$vux.toast.text('已经到底啦', 'middle')
      },
      async loadMore ($state) {
        try {
          if (!this.logedUser) {
            const {data} = await this.$apollo.query({
              query: GetLogedUserQuery
            })
            if (data && data.logedUser) {
              this.logedUser = Object.assign({}, data.logedUser)
            }
          }
          this.$apollo.query({
            query: this.query,
            variables: this.variables
          }).then(({data}) => {
            if (data && data.collection) {
              this.skip++
              this.addToList(data.collection)
              if (data.collection.length) $state.loaded()
              else $state.complete()
            } else if (data && data.records) {
              this.skip++
              this.addToList(data.records.map(({book}) => book))
              if (data.records.length) $state.loaded()
              else $state.complete()
            }
          })
        } catch (e) {
          this.$vux.alert.show({
            title: '出错了',
            content: e.message
          })
        }
      },
      addToList (books) {
        const contains = (bookId) => this.books.some(({ id }) => id === bookId)
        books.forEach((book) => {
          if (!contains(book.id)) this.books.push(book)
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
      },
      showDlg (item) {
        this.showShareDlg = true
        this.clickedItem = Object.assign({}, item)
      },
      hideDlg () {
        this.showShareDlg = false
        this.clickedItem = null
        this.message = ''
      },
      onDlgShow () {
        if (this.$refs.textarea) {
          this.$nextTick(() => {
            this.$refs.textarea.focus()
          })
        }
      },
      async sendMessage () {
        const message = this.clickedItem.id
        const messageCopy = this.message.trim()
        this.hideDlg()
        this.loading = true
        try {
          await this.$apollo.mutate({
            mutation: AddPostMutation,
            variables: {message, sessionId: this.sessionId, messageType: 'book'},
            refetchQueries: [{
              query: GetGroupedPostsQuery,
              variables: {
                skip: 0,
                limit: 20,
                sessionId: this.sessionId
              }
            }]
          })
          if (messageCopy) {
            await this.$apollo.mutate({
              mutation: AddPostMutation,
              variables: {sessionId: this.sessionId, message: messageCopy},
              refetchQueries: [{
                query: GetGroupedPostsQuery,
                variables: {
                  skip: 0,
                  limit: 20,
                  sessionId: this.sessionId
                }
              }]
            })
          }
          this.loading = false
          this.$router.push(`/talk/${this.friendId}?sessionId=${this.sessionId}`)
        } catch (e) {
          this.loading = false
          this.$vux.alert.show({
            title: '出错了',
            content: e.message
          })
        }
      }
    },
    computed: {
      link: function () {
        return `/books/${this.clickedItem.id}`
      },
      list: function () {
        return this.books.map(({ id, title, summary, picture }) => ({
          id,
          title,
          desc: summary,
          src: this.recoverPicture(picture)
        }))
      },
      query: function () {
        return this.source === 'collection' ? GetCollectionQuery : GetRecordsQuery
      },
      variables: function () {
        const opts = {
          skip: this.skip * this.limit,
          limit: this.limit
        }
        if (this.source === 'collection') {
          return { ...opts, userId: this.logedUser.id }
        } else {
          const state = this.source === 'reading' ? 'BORROWED' : 'RETURNED'
          return { ...opts, filter: { state, userId: this.logedUser.id } }
        }
      }
    },
    watch: {
      loading: function (value) {
        if (value) this.$vux.loading.show()
        else this.$vux.loading.hide()
      }
    },
    apollo: {
      user: {
        query: GetUserByIDQuery,
        variables () {
          return { id: this.friendId }
        },
        result ({ data }) {
          if (data && data.user) {
            this.friend = Object.assign({}, data.user)
          }
        },
        error (error) {
          this.$vux.alert.show({
            title: '出错了',
            content: error.message
          })
        }
      }
    },
    props: {
      source: {
        type: String,
        required: true,
        default: 'collection'
      },
      friendId: {
        type: String,
        required: true
      },
      sessionId: {
        type: String,
        required: true
      }
    }
  }
</script>

<style scoped>
  .h-strech{
    height: calc(100% - 46px);
  }
  .avatar{
    width: 48px;
    height: 48px;
  }
  .no-bt >>> .weui-cells{
    line-height: 1.1;
    margin-top: 10px;
  }
  .no-bt >>> .weui-cells:before{
    border-top: none;
  }
</style>
