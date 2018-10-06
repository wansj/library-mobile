<template>
  <div class="h-100 overflow-hidden">
    <sticky class="bg-gradient">
      <div class="navbar ph3 pv2 flex bb b--silver">
        <div class="flex-grow-0 flex-shrink-0 tc logo">
          <router-link to="/" tag="div" class="relative">
            <img src="../assets/logo.png" class="w-100 h2">
            <div class="f5 lh-solid absolute top-2 left-0">图书馆</div>
          </router-link>
        </div>
        <div class="flex-auto search relative">
          <x-input placeholder="书名/作者/译者" class="large" v-model="keyword" @on-change="getSearchOptions" @on-enter="doSearch" ref="search">
            <icon type="search" slot="label" class="f3"></icon>
          </x-input>
          <group :class="{absolute: true, options: true, dn: !showOpts}">
            <cell v-for="(item, i) in results" :key="i" :title="item.title" @click.native="resultClick(item)"></cell>
          </group>
        </div>
        <router-link tag="div" to="/books/cart/view" class="w2 flex-grow-0 flex-shrink-0 tc cart">
          <i class="iconfont vux-icon-lib-shop-cart- relative">
            <span class="red absolute f6 lh-solid top-0">{{cartCount}}</span>
          </i>
        </router-link>
      </div>
    </sticky>
    <flexbox class="h-100">
      <grid v-if="showResult" :cols="1" :show-lr-borders="false" class="w-100 h-100 bg-white">
        <grid-item v-for="book in booksFiltered" :key="book.id" :link="{path: `/books/${book.id}`}" class="flex custom_icon">
          <div class="w3 h3" slot="icon">
            <img :src="recoverPicture(book.picture)">
          </div>
          <div slot="label">
            <div class="title b f5">{{title(book)}}</div>
            <div class="author silver">{{author(book)}}</div>
            <div class="publisher f7">{{book.publisher}}</div>
          </div>
        </grid-item>
      </grid>
      <template v-else>
        <flexbox-item :span="1/4" class="tc sidebar h-100">
          <ApolloQuery :query="require('../constants/graphql-queries').GetRootCategoriesQuery">
            <template slot-scope="{ result: { loading, error, data } }">
              <!-- Loading -->
              <div v-if="loading" class="loading apollo">Loading...</div>
              <!-- Error -->
              <div v-else-if="error" class="error apollo">An error occured</div>
              <!-- Result -->
              <view-box v-else-if="data" class="result apollo">
                <grid :cols="1" class="bg-white" :show-lr-borders="false" style="overflow-y: auto">
                  <grid-item v-for="(category, i) in data.rootCategories" :key="category.id" :class="{active: isActive(category, i), 'lh-title': true}">
                    <span class="grid-center" @click="getChildren(category)">{{category.label}}</span></grid-item>
                </grid>
              </view-box>
            </template>
          </ApolloQuery>
        </flexbox-item>
        <flexbox-item class="h-100">
          <category-details :children="children" :label="categoryLabel"></category-details>
        </flexbox-item>
      </template>
    </flexbox>
  </div>
</template>

<script>
  import { Flexbox, FlexboxItem, Grid, GridItem, Sticky, XInput, Icon, ViewBox, Group, Cell } from 'vux'
  import { GetChildrenCategoriesQuery, GetCartCountQuery, GetBooksQuery } from '../constants/graphql-queries'
  import { SEARCH_HISTORY } from '../constants/settings'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'category-layout',
    components: {
      Flexbox,
      FlexboxItem,
      Grid,
      GridItem,
      Sticky,
      XInput,
      Icon,
      ViewBox,
      Group,
      Cell,
      'category-details': () => import('./CategoryDetails.vue').then(m => m.default)
    },
    data () {
      return {
        active: '', // 当前选中的Category的id
        cartCount: 0,
        children: [],
        categoryLabel: '',
        showResult: false, // 是否显示检索结果
        booksFiltered: [], // 过滤后的结果
        skip: 0,
        limit: 100,
        keyword: '', // 检索词
        showOpts: true, // 是否显示搜索选项
        results: [], // 搜素选项
        imgMap: new Map()
      }
    },
    apollo: {
      cartCount: { query: GetCartCountQuery }
    },
    methods: {
      title (book) {
        const volume = book.volume > 1 ? `(共${book.volume}册）` : ''
        return `${book.title}${volume}`
      },
      author (book) {
        const [first, second] = book.authors
        return `${first}${second ? '等' : ''}著`
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
      isActive (category, i) {
        if (!this.active) {
          this.getChildren(category) // active初始化
          return i === 0
        } else return this.active === category.id
      },
      getChildren (category) {
        this.active = category.id
        this.$apollo.query({
          query: GetChildrenCategoriesQuery,
          variables: { id: category.id }
        }).then(({ data: { childrenCategories } }) => {
          this.children = [...childrenCategories]
          this.categoryLabel = category.label
        })
      },
      getSearchOptions () {
        const history = localStorage.getItem(SEARCH_HISTORY)
        if (history) {
          const keywords = history.split(',')
          const matched = keywords.filter(word => {
            return word.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1
          })
          const array = matched.length > 0 ? [...matched] : [...keywords]
          this.results = array.map(keyword => ({ title: keyword }))
          this.showOpts = true
        }
        if (this.keyword === '') this.showResult = false
      },
      resultClick (item) {
        this.keyword = item.title
        this.$refs.search.focus()
        this.$nextTick(() => {
          this.showOpts = false
        })
      },
      doSearch () {
        const history = localStorage.getItem(SEARCH_HISTORY)
        const keywords = history ? history.split(',') : []
        if (this.keyword && keywords.indexOf(this.keyword) === -1) {
          keywords.push(this.keyword)
          localStorage.setItem(SEARCH_HISTORY, keywords.join(','))
        }
        // 进行检索
        this.$apollo.query({
          query: GetBooksQuery,
          variables: {
            skip: this.skip,
            limit: this.limit,
            filter: { keyword: this.keyword, category: this.active }
          }
        }).then(({data}) => {
          this.booksFiltered = [...data.booksFiltered]
          this.showResult = true
        })
      }
    }
  }
</script>

<style scoped>
  .logo{
    width: 50px;
  }
  .cart{
    line-height: 45px;
  }
  .cart >>> i{
    font-size: 1.5rem;
  }
  .search >>> .vux-x-input{
    padding: .5rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin: 0 .5rem;
  }
  .large >>> .weui-cell__hd > i{
    font-size: 1.5rem;
    padding-left: 0;
  }
  .grid-center {
    display: block;
    text-align: center;
    color: #333;
  }
  .active{
    background: #f4f4f4;
    border-left: 5px solid orange;
  }
  .bg-gradient{
    background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(244,244,244,1) 100%);
    background: -moz-linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(244,244,244,1) 100%);
    background: -webkit-linear-gradient(to bottom, rgba(255,255,255,1) 0%,rgba(244,244,244,1) 100%);
  }
  .vux-icon-lib-shop-cart- > span{
    left: 10px;
  }
  .result{
    height: 600px;
  }
  .options >>> .vux-no-group-title{
    margin-top: 0;
    margin-left: 8px;
    margin-right: 8px;
    width: 245px;
    border: 1px solid #eee;
  }
  .custom_icon >>> .weui-grid__icon{
    height: 100%;
    flex: none; /*当layout为0时才起效，父容器的display为flex*/
    width: auto;
  }
  .custom_icon >>> .weui-grid__label{
    padding-left: 5px;
    margin-top: 0;
    text-align: left;
    white-space: pre-line; /*自动换行，合并空白*/
    flex: auto; /*当layout为0时才起效，父容器的display为flex*/
  }
</style>
