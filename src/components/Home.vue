<template>
  <div class="root">
    <card class="ph3 pb3">
      <div slot="header" class="flex justify-between weui-panel__hd">
        <span>借阅榜</span>
        <span @click="skip++"><i class="iconfont vux-icon-lib-huanyihuan mr1"></i>换一换</span>
      </div>
      <flexbox slot="content" class="panel mt3" align="stretch">
        <p class="w-100 flex items-center justify-center" v-if="$apollo.queries.mostBorrowed.loading">
          <spinner type="bubbles"></spinner>
        </p>
        <template v-else-if="mostBorrowed.length > 0">
          <flexbox-item v-for="record in mostBorrowed" :key="record.book.id">
            <router-link tag="div" class="tc w-100 truncate" :to="bookDetailsLnk(record.book.id)">
              <img :src="recoverPicture(record.book.picture)" class="cover center"><br>
              <span class="f6 mt1">{{record.book.title}}</span><br>
              <span class="light-blue f6">{{record.count}}次借阅</span>
            </router-link>
          </flexbox-item>
        </template>
        <div class="w-100 flex items-center justify-center" v-else>
          <span><icon type="info"></icon>没有数据</span>
        </div>
      </flexbox>
    </card>
    <card class="ph3 pb3">
      <div slot="header" class="flex justify-between weui-panel__hd">
        <span>收藏榜</span>
        <span @click="skip2++"><i class="iconfont vux-icon-lib-huanyihuan mr1"></i>换一换</span>
      </div>
      <flexbox slot="content" class="panel mt3" align="stretch">
        <p class="w-100 flex items-center justify-center" v-if="$apollo.queries.mostCollected.loading">
          <spinner type="bubbles"></spinner>
        </p>
        <template v-else-if="mostCollected.length > 0">
          <flexbox-item v-for="record in mostCollected" :key="record.book.id">
            <router-link tag="div" class="tc w-100 truncate" :to="bookDetailsLnk(record.book.id)">
              <img :src="recoverPicture(record.book.picture)" class="cover center"><br>
              <span class="f6 mt1">{{record.book.title}}</span><br>
              <span class="light-blue f6">{{record.count}}次收藏</span>
            </router-link>
          </flexbox-item>
        </template>
        <div class="w-100 flex items-center justify-center" v-else>
          <span><icon type="info"></icon>没有数据</span>
        </div>
      </flexbox>
    </card>
    <card class="ph3 pb3">
      <div slot="header" class="flex justify-between weui-panel__hd">
        <span>推荐榜</span>
        <span @click="skip3++"><i class="iconfont vux-icon-lib-huanyihuan mr1"></i>换一换</span>
      </div>
      <flexbox slot="content" class="panel mt3" align="stretch">
        <p class="w-100 flex items-center justify-center" v-if="$apollo.queries.mostRecommanded.loading">
          <spinner type="bubbles"></spinner>
        </p>
        <template v-else-if="mostRecommanded.length > 0">
          <flexbox-item v-for="record in mostRecommanded" :key="record.book.id">
            <router-link tag="div" class="tc w-100 truncate" :to="bookDetailsLnk(record.book.id)">
              <img :src="recoverPicture(record.book.picture)" class="cover center"><br>
              <span class="f6 mt1">{{record.book.title}}</span><br>
              <span class="light-blue f6">{{record.count}}次推荐</span>
            </router-link>
          </flexbox-item>
        </template>
        <div class="w-100 flex items-center justify-center" v-else>
          <span><icon type="info"></icon>没有数据</span>
        </div>
      </flexbox>
    </card>
  </div>
</template>

<script>
  import { Card, Icon, Flexbox, FlexboxItem, Spinner } from 'vux'
  import { GetMostBorrowedQuery, GetMostCollectedQuery, GetMostRecommandedQuery } from '../constants/graphql-queries'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'home',
    components: { Card, Icon, Flexbox, FlexboxItem, Spinner },
    data () {
      return {
        skip: 0,
        limit: 3,
        skip2: 0,
        skip3: 0,
        mostBorrowed: [],
        mostCollected: [],
        mostRecommanded: [],
        imgMap: new Map()
      }
    },
    apollo: {
      mostBorrowed: {
        query: GetMostBorrowedQuery,
        variables () {
          return { skip: this.skip * this.limit, limit: this.limit }
        },
        error (error) {
          this.$vux.alert.show({
            title: '出错了',
            content: error.message
          })
        },
        result ({ data }) {
          if (data && data.mostBorrowed && (data.mostBorrowed.length === 0) && this.skip > 0) {
            this.skip = 0
          }
        }
      },
      mostCollected: {
        query: GetMostCollectedQuery,
        variables () {
          return { skip: this.skip2 * this.limit, limit: this.limit }
        },
        error (error) {
          this.$vux.alert.show({
            title: '出错了',
            content: error.message
          })
        },
        result ({ data }) {
          if (data && data.mostCollected && (data.mostCollected.length === 0) && this.skip2 > 0) {
            this.skip2 = 0
          }
        }
      },
      mostRecommanded: {
        query: GetMostRecommandedQuery,
        variables () {
          return { skip: this.skip3 * this.limit, limit: this.limit }
        },
        error (error) {
          this.$vux.alert.show({
            title: '出错了',
            content: error.message
          })
        },
        result ({ data }) {
          if (data && data.mostRecommanded && (data.mostRecommanded.length === 0) && this.skip3 > 0) {
            this.skip3 = 0
          }
        }
      }
    },
    methods: {
      bookDetailsLnk (bookId) {
        return `/books/${bookId}`
      },
      recoverPicture (pic) {
        if (pic && pic.file) {
          if (this.imgMap.has(pic)) return this.imgMap.get(pic)
          else {
            const url = transformUploadToURL(pic.file)
            this.imgMap.set(pic, url)
            return url
          }
        }
        return require('../assets/nophoto.gif')
      }
    }
  }
</script>

<style scoped>
  .root{
    height: calc(100% - 53px);
    overflow-y: auto;
  }
  img.cover{
    width: 80px;
    height: 100px;
  }
  .panel{
    height: 10rem;
  }
</style>
