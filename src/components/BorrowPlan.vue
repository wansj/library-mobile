<template>
  <div class="h-100 overflow-y-hidden">
    <x-header>已预约的图书</x-header>
    <p class="tc" v-if="$apollo.queries.booksInPlan.loading">
      <span class="v-mid dib">&nbsp;&nbsp;加载中</span><inline-loading></inline-loading>
    </p>
    <template v-else-if="booksInPlan">
      <card :header="headerTxt(booksInPlan.expireAt)">
        <group slot="content" class="rm-mt">
          <cell-box class="flex" v-for="book in booksInPlan.books" :key="book.id" :link="{path: `/books/${book.id}`}">
            <img :src="recoverPicture(book.picture)" class="w3 h3 mt2 flex-none self-start">
            <div class="flex-auto ml2">
              <div class="f5 b lh-copy truncate">{{book.title}}<span class="normal ml1">{{authorsDesc(book.authors)}}</span></div>
              <div class="f6 lh-cpoy silver">{{book.category}}</div>
              <div class="f6 lh-copy silver">{{locDesc(book.location)}}</div>
              <div class="rm-mt">
                <x-button mini @click.native="(e) => removeFromPlan(e, book.id)">取消预约</x-button>
                <x-button mini @click.native="(e) => moveToCart(e, book.id)">放回书单</x-button>
              </div>
            </div>
          </cell-box>
        </group>
      </card>
    </template>
    <div v-else class="tc pt6">
      <x-icon type="ios-information-outline" size="60"></x-icon>
      <div>您还没有预约图书哦！</div>
    </div>
  </div>
</template>

<script>
  import { XHeader, Card, dateFormat, CellBox, Group, CheckIcon, XButton } from 'vux'
  import { GetBooksInPlanQuery, GetBooksInCartQuery, GetCartCountQuery } from '../constants/graphql-queries'
  import { RemoveFromBorrowPlanMutation, MoveToCartMutation } from '../constants/graphql-mutations'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'borrow-plan',
    data () {
      return {
        booksInPlan: null,
        selection: {},
        imgMap: new Map()
      }
    },
    methods: {
      moveToCart (e, bookId) {
        e.stopPropagation()
        this.$apollo.mutate({
          mutation: MoveToCartMutation,
          variables: {
            bookId
          },
          refetchQueries: [{
            query: GetBooksInPlanQuery,
            variables: {kind: 'BORROW'}
          }, {
            query: GetBooksInCartQuery
          }, {
            query: GetCartCountQuery
          }]
        }).then(() => {
          this.$vux.alert.show({
            title: '恭喜',
            content: '成功放回书单'
          })
        }).catch(err => {
          this.$vux.alert.show({
            title: '操作失败',
            content: err.message
          })
        })
      },
      removeFromPlan (e, bookId) {
        e.stopPropagation()
        this.$apollo.mutate({
          mutation: RemoveFromBorrowPlanMutation,
          variables: {
            bookIds: [bookId]
          },
          refetchQueries: [{query: GetBooksInPlanQuery, variables: {kind: 'BORROW'}}]
        }).then(() => {
          this.$vux.alert.show({
            title: '恭喜',
            content: '取消预约成功'
          })
        }).catch(err => {
          this.$vux.alert.show({
            title: '操作失败',
            content: err.message
          })
        })
      },
      headerTxt (date) {
        return { title: `预约时间：${dateFormat(new Date(date), 'YYYY年MM月DD日')}` }
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
      authorsDesc (authors) {
        if (authors.length > 1) return `${authors[0]}等`
        return `${authors[0]}`
      },
      locDesc (loc) {
        const [shelf, floor] = loc.split('-')
        return `第${shelf}个书架，第${floor}层`
      }
    },
    apollo: {
      booksInPlan: {
        query: GetBooksInPlanQuery,
        variables: {kind: 'BORROW'}
      }
    },
    components: { XHeader, Card, CellBox, Group, CheckIcon, XButton }
  }
</script>

<style scoped>
  .rm-mt >>> .weui-cells{
    margin-top: 0;
  }
  .rm-mt >>> .weui-cells:before, .rm-mt >>> .weui-cells:after{
    display: none;
  }
  /*46px是XHeader的高度*/
  .weui-panel{
    height: calc(100% - 46px);
  }
  /*54px是card的margin-top:10px和card的header高度44px*/
  .weui-panel >>> .weui-panel__bd{
    height: calc(100% - 54px);
    overflow-y: auto
  }
</style>
