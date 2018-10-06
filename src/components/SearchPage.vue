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
        <search placeholder="书名/作者/译者" v-model="keyword" :results="results" @on-change="getSearchOptions" position="relative"
                @result-click="resultClick" @on-submit="doSearch" ref="search"></search>
        <div class="bg-white flex bb b--line">
          <div class="flex-auto flex justify-between ph3 pv2 br b--line">
            <div class="flex-auto lh2">
              <ApolloQuery :query="require('../constants/graphql-queries').BooksCountQuery" :variables="countVar">
                <template slot-scope="{ result: { data } }">
                  <span v-if="data"><em class="red">{{data.bookCount}}</em>个结果</span>
                  <span v-else><em class="red">0</em>个结果</span>
                </template>
              </ApolloQuery>
            </div>
            <i :class="displayIconClass" @click="changeDisplay"></i>
          </div>
          <div class="flex-grow-0 flex-shrink-0 ph3 relative">
            <span class="lh3" @click="showPopup = !showPopup">筛选({{filterCount}})</span>
            <x-icon type="ios-arrow-down" size="18"></x-icon>
            <filter-popup :category="filter.category||category" v-if="showPopup" @filterChanged="refetch" @sortChanged="refetch"></filter-popup>
          </div>
        </div>
      </sticky>
      <div class="bg-white overflow-container content">
        <grid :cols="cols" :show-lr-borders="false">
          <grid-item v-for="book in booksFiltered" :key="book.id" :link="{path: `/books/${book.id}`}" :class="gridCls">
            <div :class="iconCls" slot="icon">
              <img :src="recoverPicture(book.picture)">
            </div>
            <div slot="label" :class="lblCls">
              <div class="title b f5">{{title(book)}}</div>
              <div class="author silver">{{author(book)}}</div>
              <div class="publisher f7">{{book.publisher}}</div>
            </div>
          </grid-item>
          <infinite-loading @infinite="loadMore" ref="infiniteLoading">
            <span slot="no-more">已经到底啦！</span>
            <span slot="no-results">
              <x-icon type="ios-information-outline" size="60"></x-icon>
              <div>没有图书</div>
            </span>
          </infinite-loading>
        </grid>
      </div>
    </div>
</template>

<script>
  import { XHeader, Sticky, XInput, Group, Icon, Grid, GridItem, XButton, Search } from 'vux'
  import InfiniteLoading from 'vue-infinite-loading'
  import { transformUploadToURL } from '../utils'
  import { GetBooksQuery, GetCartCountQuery } from '../constants/graphql-queries'
  import { SEARCH_HISTORY } from '../constants/settings'

  export default {
    name: 'search-page',
    props: {
      category: {
        type: String,
        required: true
      }
    },
    components: {
      XHeader,
      Sticky,
      XInput,
      Group,
      Icon,
      Grid,
      GridItem,
      XButton,
      InfiniteLoading,
      Search,
      'filter-popup': () => import('./FilterPopup.vue').then(m => m.default)
    },
    data () {
      return {
        cartCount: 0,
        filterCount: 1,
        filter: {},
        layout: 0,
        skip: 0,
        limit: 6,
        booksFiltered: [],
        showPopup: false,
        keyword: '',
        results: [],
        imgMap: new Map()
      }
    },
    apollo: {
      cartCount: { query: GetCartCountQuery }
    },
    computed: {
      countVar: function () {
        const vars = { ...this.filter, category: this.filter.category || this.category }
        return { filter: vars }
      },
      lblCls: function () {
        return this.layout ? '' : 'list-views'
      },
      gridCls: function () {
        return { custom_icon: true, flex: !this.layout }
      },
      iconCls: function () {
        return ['center', `w${this.large ? 4 : 3}`, `h${this.large ? 4 : 3}`]
      },
      cols: function () {
        return this.layout === 1 ? 2 : 1
      },
      large: function () {
        return this.layout === 2
      },
      displayIconClass: function () {
        switch (this.layout) {
          case 0:
            return ['iconfont', 'vux-icon-lib-bars']
          case 1:
            return ['iconfont', 'vux-icon-lib-grid1']
          case 2:
            return ['iconfont', 'vux-icon-lib-grid']
        }
      }
    },
    methods: {
      changeDisplay () {
        this.layout = this.layout < 2 ? (this.layout + 1) : 0
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
      title (book) {
        const volume = book.volume > 1 ? `(共${book.volume}册）` : ''
        return `${book.title}${volume}`
      },
      author (book) {
        const [first, second] = book.authors
        return `${first}${second ? '等' : ''}著`
      },
      addToList (books) {
        const added = books.filter(book => {
          const include = this.booksFiltered.some(({ id }) => id === book.id)
          if (!include) return true
        })
        if (added.length) {
          this.booksFiltered = [...this.booksFiltered, ...added]
        }
      },
      loadMore ($state) {
        this.$apollo.query({
          query: GetBooksQuery,
          variables: {
            filter: { ...this.filter, category: this.filter.category || this.category },
            skip: this.skip * this.limit,
            limit: this.limit
          }
        }).then(({ data }) => {
          if (data && data.booksFiltered) {
            this.skip++
            this.addToList(data.booksFiltered)
            if (data.booksFiltered.length) $state.loaded()
            else $state.complete()
          }
        })
      },
      refetch (newFilters, oldFilters, sortField) {
        if (newFilters && oldFilters) {
          const count = Object.keys(newFilters).length
          if (count !== Object.keys(oldFilters).length) {
            this.filterCount = count + 1
          }
        }
        this.filter = { ...newFilters, sortBy: sortField }
        this.skip = 0
        this.booksFiltered = []
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      },
      getSearchOptions () {
        const history = localStorage.getItem(SEARCH_HISTORY)
        if (history) {
          const keywords = history.split(',')
          const matched = keywords.filter(word => {
            return word.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1
          })
          this.results = matched.map(keyword => ({ title: keyword }))
        }
      },
      resultClick (item) {
        this.keyword = item.title
        this.$refs.search.setFocus()
      },
      doSearch () {
        const history = localStorage.getItem(SEARCH_HISTORY)
        const keywords = history ? history.split(',') : []
        if (this.keyword && keywords.indexOf(this.keyword) === -1) {
          keywords.push(this.keyword)
          localStorage.setItem(SEARCH_HISTORY, keywords.join(','))
        }
        // 进行检索
        this.filter = { keyword: this.keyword }
        this.skip = 0
        this.booksFiltered = []
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset')
      }
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
  .large >>> .weui-cell__hd > i{
    font-size: 1.5rem;
    padding-left: 0;
  }
  .vux-icon-lib-bars, .vux-icon-lib-grid1, .vux-icon-lib-grid{
    font-size: 1.25rem;
    color: #ccc
  }
  .lh2{
    line-height: 2rem;
  }
  .lh3{
    line-height: 3rem;
  }
  svg{
    vertical-align: text-bottom;
  }
  .custom_icon >>> .weui-grid__icon{
    height: 100%;
    flex: none; /*当layout为0时才起效，父容器的display为flex*/
    width: auto;
  }
  .custom_icon >>> .weui-grid__label{
    text-align: left;
    white-space: pre-line; /*自动换行，合并空白*/
    flex: auto; /*当layout为0时才起效，父容器的display为flex*/
  }
  /*当layout为0时才应用此class*/
  .list-views{
    margin-top: -5px;
    padding-left: .5rem;
  }
  .content{
    height: calc(100% - 95px);
    /*padding-bottom: 100px;*/
  }
</style>
