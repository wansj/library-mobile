<template>
  <div class="h-100">
    <p class="tc" v-if="$apollo.queries.user.loading || $apollo.queries.logedUser.loading">
      <span class="v-mid dib f6">加载中&nbsp;&nbsp;</span><inline-loading></inline-loading>
    </p>
    <template v-else-if="logedUser && user">
      <x-header :left-options="{backText: '聊天'}" :title="friendName">
        <i class="iconfont vux-icon-lib-avatar" slot="right"></i>
      </x-header>
      <div :class="{'overflow-container': true, 'h-strech': true, 'show-emotion': showEmotion || showShare}" infinite-wrapper ref="scrollParent">
        <infinite-loading @infinite="loadMore" ref="infiniteLoading" @$InfiniteLoading:complete="allLoaded" force-use-infinite-wrapper direction="top">
          <span slot="no-more"></span>
          <span slot="no-results">还没有聊天记录</span>
        </infinite-loading>
        <div v-for="group in messageList" :key="group.iat" class="tc mt2">
          <span class="lh-title bg-moon-gray white f6 pa1 br2">{{group.iat}}</span>
          <div v-for="post in group.posts" :key="post.id" :class="{flex: true, 'flex-row-reverse': isMe(post), 'items-center': true, mt2: true}">
            <img :src="getAvatar(post)" class="avatar mh2"/>
            <router-link tag="div" :to="getLink(post.book.id)" :class="['bg-white', 'relative', 'br2', 'pa1', isMe(post) ? 'arrow-left': 'arrow-right']" v-if="post.book">
              <template v-if="post.book.summary">
                <p class="f5 lh-copy two_line_ellipsis tl" style="margin-left: 6px;">{{post.book.title}}</p>
                <div class="flex">
                  <div class="lh-copy f7 silver three_line_ellipsis">{{post.book.summary}}</div>
                  <img :src="recoverPicture(post.book.picture)" class="book-cover ml1">
                </div>
              </template>
              <div class="flex items-center" v-else>
                <img class="book-cover mr1" :src="recoverPicture(post.book.picture)">
                <span class="two_line_ellipsis">{{post.book.title}}</span>
              </div>
            </router-link>
            <span :class="['bg-message', 'relative', 'br2', 'pa2', 'lh-title', isMe(post) ? 'arrow-left': 'arrow-right']" v-else>{{post.message}}</span>
          </div>
        </div>
      </div>
    </template>
    <div class="fixed bottom-0 w-100 bg-white-80">
      <group class="flex items-center">
        <x-textarea v-model="message" :rows="1" :show-counter="false" autosize :class="borderCls" @on-focus="focused=true" @on-blur="focused=false"></x-textarea>
        <i class="iconfont vux-icon-lib-keyboard lh-solid mh1" style="font-size: 30px;" @click="showEmotion=false" v-if="showEmotion"></i>
        <i class="iconfont vux-icon-lib-biaoqing lh-solid mh1" style="font-size: 30px;" @click="showEmotion=true" v-else></i>
        <x-button type="primary" mini @click.native="sendMessage" v-if="canSend">发送</x-button>
        <template v-else><x-icon type="ios-plus-outline" size="32" class="ph1" @click="showShare=true"></x-icon></template>
      </group>
      <div v-if="showEmotion || showShare">
        <divider></divider>
        <swiper :show-desc-mask="false" dots-position="center" v-if="showEmotion">
          <swiper-item v-for="group in emojis" :key="objKey(group)">
            <grid :show-lr-borders="false" :show-vertical-dividers="false" :cols="7" style="height: 135px;">
              <grid-item v-for="emoji in objValue(group)" :key="objKey(emoji)" class="f3" @on-item-click="insert(objValue(emoji))">
                {{objValue(emoji)}}
              </grid-item>
            </grid>
          </swiper-item>
        </swiper>
        <div class="share panel ph3" v-else>
          <grid :show-lr-borders="false" :show-vertical-dividers="false" :cols="4">
            <grid-item class="silver tc" :link="generateLink('read')">
              <div class="round-rect ba tc">
                <i class="iconfont vux-icon-lib-history f4"></i>
              </div>
              <div class="f7">我读过的</div>
            </grid-item>
            <grid-item class="silver tc" :link="generateLink('reading')">
              <div class="round-rect ba tc">
                <i class="iconfont vux-icon-lib-reading f4"></i>
              </div>
              <div class="f7">正在读的</div>
            </grid-item>
            <grid-item class="silver tc" :link="generateLink()">
              <div class="round-rect ba tc">
                <i class="iconfont vux-icon-lib-shoucang f4"></i>
              </div>
              <div class="f7">我的收藏</div>
            </grid-item>
          </grid>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { XHeader, XTextarea, XButton, Group, dateFormat, Divider, Swiper, SwiperItem, Grid, GridItem } from 'vux'
  import InfiniteLoading from 'vue-infinite-loading'
  import { GetUserByIDQuery, GetLogedUserQuery, GetGroupedPostsQuery } from '../constants/graphql-queries'
  import { AddPostMutation } from '../constants/graphql-mutations'
  import { PostAddedSubscription } from '../constants/graphql-subscriptions'
  import { transformUploadToURL } from '../utils'
  import emojisTable from './emojis'

  export default {
    name: 'talk',
    data () {
      return {
        user: null,
        logedUser: null,
        focused: false,
        message: '',
        messageList: [],
        skip: 0,
        limit: 20,
        showEmotion: false,
        showShare: false,
        emojiCategory: 'People',
        savedPosition: 0,
        imgMap: new Map()
      }
    },
    apollo: {
      $subscribe: {
        postAdded: {
          query: PostAddedSubscription,
          variables () {
            return {sessionId: this.sessionId}
          },
          result ({data}) {
            this.addToList([{iat: dateFormat(new Date(data.postAdded.iat), 'HH:mm'), posts: [data.postAdded]}], 'after')
            this.$nextTick(() => {
              const scrollParent = this.$refs.scrollParent
              scrollParent.scrollTop = scrollParent.scrollHeight - scrollParent.offsetHeight
            })
          }
        }
      },
      user: {
        query: GetUserByIDQuery,
        variables () {
          return { id: this.friendId }
        }
      },
      logedUser: {
        query: GetLogedUserQuery
      }
    },
    computed: {
      emojis: function () {
        return Object.keys(emojisTable).map((grpName) => {
          const group = emojisTable[grpName]
          const value = Object.keys(group).map((emojiName) => ({ [emojiName]: group[emojiName] }))
          return { [grpName]: value }
        })
      },
      canSend: function () {
        return this.message.trim().length > 0
      },
      borderCls: function () {
        return this.focused ? 'vux-1px-b-active' : 'vux-1px-b'
      },
      myAvatar: function () {
        if (this.logedUser && this.logedUser.photo) return this.recoverPicture(this.logedUser.photo)
        return require('../assets/me.png')
      },
      friendName: function () {
        return this.user ? this.user.username : ''
      },
      friendAvatar: function () {
        if (this.user && this.user.photo) return this.recoverPicture(this.user.photo)
        return require('../assets/me.png')
      }
    },
    methods: {
      getLink (bookId) {
        return `/books/${bookId}`
      },
      generateLink (source) {
        const str = `/share/${this.friendId}?sessionId=${this.sessionId}`
        if (!source) return str
        else return `${str}&source=${source}`
      },
      objValue (group) {
        return Object.values(group)[0]
      },
      objKey (obj) {
        return Object.keys(obj)[0]
      },
      insert (emoji) {
        this.message += emoji
      },
      getAvatar (post) {
        return this.isMe(post) ? this.myAvatar : this.friendAvatar
      },
      allLoaded () {
        if (this.messageList.length > 0) this.$vux.toast.text('已经到顶啦', 'middle')
      },
      loadMore ($state) {
        this.$apollo.query({
          query: GetGroupedPostsQuery,
          variables: {
            skip: this.skip * this.limit,
            limit: this.limit,
            sessionId: this.sessionId
          }
        }).then(({ data }) => {
          if (data && data.posts) {
            this.skip++
            this.addToList(data.posts)
            this.$nextTick(() => {
              const scrollParent = this.$refs.scrollParent
              if (!this.savedPosition) this.savedPosition = scrollParent.offsetHeight
              scrollParent.scrollTop = scrollParent.scrollHeight - this.savedPosition
              // 记录滚动位置
              this.savedPosition = scrollParent.scrollHeight
            })
            if (data.posts.length) $state.loaded()
            else $state.complete()
          }
        })
      },
      addToList (groups, position = 'before') {
        groups.forEach(({iat, posts}) => {
          const index = this.messageList.findIndex(message => message.iat === iat)
          // 如果已经存在该分组（即时间标签相同的），则进行合并
          if (index > -1) {
            const theGroup = this.messageList[index]
            let changed = false
            posts.forEach(post => {
              if (!theGroup.posts.some(({id}) => id === post.id)) {
                changed = true
                theGroup.posts.push(post)
              }
            })
            if (changed) {
              theGroup.posts.sort((a, b) => a.iat > b.iat)
              this.messageList.splice(index, 1, theGroup)
            }
          } else {
            if (position === 'before') this.messageList = [...groups, ...this.messageList]
            else this.messageList = [...this.messageList, ...groups]
          }
        })
      },
      isMe (post) {
        return this.logedUser.id === post.postBy
      },
      sendMessage () {
        this.$apollo.mutate({
          mutation: AddPostMutation,
          variables: { message: this.message.trim(), sessionId: this.sessionId }
        }).then(({data}) => {
          this.message = ''
          // this.addToList([{iat: formatDate(new Date()), posts: [data.addPost]}], 'after')
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
    props: {
      friendId: {
        type: String,
        required: true
      },
      sessionId: {
        type: String,
        required: true
      }
    },
    components: { XHeader, XTextarea, XButton, Group, InfiniteLoading, Divider, Swiper, SwiperItem, Grid, GridItem }
  }
</script>

<style scoped>
  .fixed >>> .weui-cells{
    margin-top: 0;
    display: flex;
    align-items: flex-end;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .weui-cell.vux-x-textarea{
    padding: 3px 0px;
    margin-left: 1rem;
  }
  .h-strech{
    height: calc(100% - 94px);
  }
  .h-strech.show-emotion{
    height: calc(100% - 294px);
  }
  .avatar{
    width: 40px;
    height: 40px;
  }
  .book-cover{
    width: 48px;
    height: 48px;
  }
  .bg-message{
    background-color: #9fe757;
  }
  .bg-message.arrow-left, .bg-message.arrow-right, .bg-white.arrow-left, .bg-white.arrow-right{
    max-width: calc(100% - 112px);
  }
  .arrow-left:before{
    position: absolute;
    display: block;
    top: 12px;
    right: -15px;
    z-index: 9999;
    content: ' ';
    width:0;
    height:0;
    overflow:hidden;
    font-size: 0;
    line-height: 0;
    border-width: 8px;
    border-style: dashed dashed dashed solid;
    /*border-color: transparent transparent transparent #9fe757;*/
  }
  .arrow-right:before{
    position: absolute;
    display: block;
    top: 12px;
    left: -15px;
    z-index: 9999;
    content: ' ';
    width:0;
    height:0;
    overflow:hidden;
    font-size: 0;
    line-height: 0;
    border-width: 8px;
    border-style: dashed solid dashed dashed;
    /*border-color: transparent #9fe757 transparent transparent;*/
  }
  .bg-message.arrow-left:before{
    border-color: transparent transparent transparent #9fe757;
  }
  .bg-message.arrow-right:before{
    border-color: transparent #9fe757 transparent transparent;
  }
  .bg-white.arrow-left:before{
    border-color: transparent transparent transparent white;
  }
  .bg-white.arrow-right:before{
    border-color: transparent white transparent transparent;
  }
  button.weui-btn_mini{
    width: 40px;
    padding-left: 4px;
    padding-right: 4px;
  }
  .weui-grid{
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .weui-grid:after, .weui-grids:before{
    border: none;
  }
  .share.panel{
    height: 180px;
  }
  .round-rect{
    border-color: #C7C7C7;
    border-radius: 12px;
    padding: 6px 0;
    margin: 0 9px;
  }
  .iconfont.f4{
    font-size: 1.25rem;
  }
  .three_line_ellipsis{
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  .two_line_ellipsis{
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
