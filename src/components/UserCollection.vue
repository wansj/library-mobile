<template>
  <div>
    <x-header>我的收藏<a slot="right" @click="editing=!editing">{{headerRightMenu}}</a></x-header>
    <ApolloQuery
      :query="require('../constants/graphql-queries').GetCollectionQuery"
      :variables="{ userId: logedUser.id, limit, skip: skip * limit }"
    >
      <template slot-scope="{ result: { loading, error, data } }">
        <!-- Loading -->
        <div v-if="loading" class="loading apollo">Loading...</div>

        <!-- Error -->
        <div v-else-if="error" class="error apollo">An error occured</div>

        <!-- Result -->
        <div v-else-if="data" class="result apollo">
          <template v-if="data.collection.length > 0">
            <div v-for="book in data.collection" :key="book.id" class="row pa3 bb pb3 flex">
              <check-icon v-show="editing" :value="isSelected(book.id)" @click.native="toggleChecked(book.id)" class="lh4 mr1"></check-icon>
              <div class="w3 h3 flex-grow-0 flex-shrink-0 mr2">
                <img class="w-100 h-100" :src="recoverPicture(book.picture)">
              </div>
              <div class="flex-auto">
                <h4 class="normal">{{book.title}}</h4>
                <div class="summary">{{book.summary}}</div>
              </div>
              <div class="w2 flex-grow-0 flex-shrink-0 tc lh4">
                <i class="iconfont vux-icon-lib-jiebei" @click="addToCart(book.id)"></i>
              </div>
            </div>
          </template>
          <div class="tc pt6" v-else>
            <x-icon type="ios-information-outline" size="60"></x-icon>
            <div>还没有收藏图书，快去试试吧！</div>
          </div>
        </div>

      </template>
    </ApolloQuery>
    <flexbox :gutter="0" class="fixed bottom-0">
      <flexbox-item class="right-angle">
        <x-button @click.native="toggleAllSelection" :disabled="!editing">{{selectBtnText}}</x-button>
      </flexbox-item>
      <flexbox-item class="right-angle">
        <ApolloMutation
          :mutation="require('../constants/graphql-mutations').DelFromCollectionMutation"
          :variables="{
            userId: logedUser.id,
            bookIds: getSelectedBooks()
          }"
          :refetchQueries="() => ([{
            query: require('../constants/graphql-queries').GetCollectionQuery,
            variables: { userId: logedUser.id, limit, skip: skip * limit }
          }])"
          @done="delDone"
        >
          <template slot-scope="{ mutate, loading, error }">
            <x-button @click.native="mutate()" :disabled="!hasSelected||loading" :class="{enabled: hasSelected, disabled: !hasSelected}">
              删除{{delBtnText}}
            </x-button>
            <p v-if="error">An error occured: {{ error }}</p>
          </template>
        </ApolloMutation>

      </flexbox-item>
    </flexbox>
    <div v-transfer-dom>
      <alert v-model="showSuccessAlert" title="恭喜" content="加入书单成功！"></alert>
      <alert v-model="showTipAlert" title="提示" content="已经在书单里了！"></alert>
    </div>
  </div>
</template>

<script>
  import { XHeader, XButton, Flexbox, FlexboxItem, CheckIcon, Alert } from 'vux'
  import { transformUploadToURL } from '../utils'
  import { GetCartCountQuery, GetBooksInCartQuery, GetLogedUserQuery } from '../constants/graphql-queries'
  import { AddToCartMutation } from '../constants/graphql-mutations'

  export default {
    name: 'user-collection',
    components: { XHeader, XButton, Flexbox, FlexboxItem, CheckIcon, Alert },
    data () {
      return {
        editing: false,
        allSelected: false,
        skip: 0,
        limit: 5,
        selection: {},
        showSuccessAlert: false,
        showTipAlert: false,
        logedUser: null,
        imgMap: new Map()
      }
    },
    computed: {
      headerRightMenu: function () {
        return this.editing ? '取消' : '编辑'
      },
      selectionCount: function () {
        return Object.values(this.selection).filter(item => item).length
      },
      delBtnText: function () {
        return this.selectionCount ? `(${this.selectionCount})` : ''
      },
      selectBtnText: function () {
        return this.allSelected ? '取消全选' : '全选'
      },
      hasSelected: function () {
        if (Object.keys(this.selection).length === 0) return false
        return Object.values(this.selection).some(bl => bl === true)
      }
    },
    apollo: {
      logedUser: {
        query: GetLogedUserQuery
      }
    },
    watch: {
      editing: function (val) {
        if (!val) {
          this.selection = {}
          this.allSelected = false
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
        return require('../assets/nophoto.gif')
      },
      addToCart (bookId) {
        this.$apollo.mutate({
          mutation: AddToCartMutation,
          variables: {
            bookId,
            userId: this.logedUser.id
          },
          refetchQueries: [{
            query: GetCartCountQuery
          }, {
            query: GetBooksInCartQuery
          }]
        }).then(({ data }) => {
          if (data.addToCart) this.showSuccessAlert = true
          else this.showTipAlert = true
        })
      },
      isSelected (bookId) {
        // 因为组件render的时候会调用此方法，所以在这里对selection进行初始化
        if (this.selection[bookId] === undefined) this.selection[bookId] = false
        return !!this.selection[bookId]
      },
      toggleChecked (bookId) {
        // 使用this.selection[bookId] = !this.selection[bookId]不会触发视图自动更新
        this.selection = { ...this.selection, [bookId]: !this.selection[bookId] }
      },
      toggleAllSelection () {
        // 取消全选
        if (this.allSelected) {
          this.selection = Object.keys(this.selection).reduce((memo, key) => {
            memo = { ...memo, [key]: false }
            return memo
          }, {})
        } else { // 全选
          this.selection = Object.keys(this.selection).reduce((memo, key) => {
            memo = { ...memo, [key]: true }
            return memo
          }, {})
        }
        this.allSelected = !this.allSelected
      },
      getSelectedBooks () {
        return Object.keys(this.selection).filter(key => this.selection[key])
      },
      delDone () {
        this.editing = false
      }
    }
  }
</script>

<style scoped>
  .right-angle >>> .weui-btn{
    border-radius: 0;
  }
  .right-angle >>> .weui-btn:after{
    border-radius: 0;
  }
  .right-angle >>> .weui-btn.enabled{
    color: #ff9900;
  }
  .right-angle >>> .weui-btn.disabled{
    color: rgba(255, 153, 0, 0.3);
  }
  .row.bb{
    border-bottom-color: rgb(229, 229, 229);
  }
  .summary{
    color: #999999;
    font-size: 13px;
    position: relative;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .lh4{
    line-height: 4rem;
  }
</style>
