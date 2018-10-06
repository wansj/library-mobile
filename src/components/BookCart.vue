<template>
  <div>
    <card class="bg-white h-100">
      <group class="ph3 rm-mt" slot="header">
        <div slot="title" class="f4 lh-copy pv2">
          <span>小计（{{booksInCart.length}}本图书）</span>
          <inline-x-switch v-model="showAvailable" class="fr"></inline-x-switch>
        </div>
        <datetime v-model="borrowDate" clear-text="选择借书日期" class="pa0" :start-date="today" :end-date="aWeekLater" @on-confirm="addToBorrowPlan">
          <x-button type="primary" :disabled="!canBorrow" @click.native="showDateTime=true">立即预约借书</x-button>
        </datetime>
      </group>
      <group slot="content" class="overflow-y-auto">
        <cell-box class="flex" v-for="book in booksInCart" :key="book.id" :link="{path: `/books/${book.id}`}">
          <check-icon class="flex-none self-start" style="margin-top: 1.5rem;" :value="isSelected(book.id)" @click.native="(e) => toggleChecked(e, book.id)"></check-icon>
          <img :src="recoverPicture(book.picture)" class="w3 h3 mt2 flex-none self-start">
          <div class="flex-auto ml2">
            <div class="f5 b lh-copy truncate">{{book.title}}<span class="normal ml1">{{authorsDesc(book.authors)}}</span></div>
            <div class="f6 lh-cpoy silver">{{book.category}}</div>
            <div :class="{'f6':true, 'lh-copy':true, green: isAvailable(book), red: !isAvailable(book)}">{{isAvailable(book) ? '可借' : '暂无'}}</div>
            <div class="f6 lh-copy silver">{{locDesc(book.location)}}</div>
            <div class="rm-mt">
              <x-button mini @click.native="(e) => removeFromCart(e, book.id)">删除</x-button>
              <x-button mini @click.native="(e) => moveToCollection(e, book.id)">移入收藏夹</x-button>
              <x-button mini @click.native="(e) => notifyMe(e, book.isbn)" v-if="!isAvailable(book)">有书通知我</x-button>
            </div>
          </div>
        </cell-box>
      </group>
    </card>
    <div v-transfer-dom>
      <alert v-model="showAlert" :title="alertTitle" :content="alertMsg"></alert>
    </div>
  </div>
</template>

<script>
  import { Card, Group, XButton, CellBox, Alert, CheckIcon, Datetime, dateFormat, InlineXSwitch } from 'vux'
  import { GetBooksInCartQuery, GetCartCountQuery, GetBooksInPlanQuery, GetSubsInCartQuery } from '../constants/graphql-queries'
  import { RemoveFromCartMutation, MoveFromCartToCollection, AddToBorrowPlanMutation, AddToSubsMutation } from '../constants/graphql-mutations'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'bookMenu',
    data () {
      return {
        selection: {},
        borrowDate: '',
        booksInCart: [],
        alertMsg: '',
        alertTitle: '',
        showAlert: false,
        showAvailable: false,
        imgMap: new Map()
      }
    },
    watch: {
      showAvailable: async function (val) {
        if (val) {
          this.booksInCart = [...this.booksInCart.filter(({ count }) => !!count)]
        } else {
          // 从Apollo缓存中读，因为ApolloClient默认的fetch策略为cache-first,所以此处不会向服务器发送request
          const { data } = await this.$apollo.query({ query: GetBooksInCartQuery })
          this.booksInCart = [...data.booksInCart]
        }
      }
    },
    methods: {
      notifyMe (e, isbn) {
        e.stopPropagation()
        this.$apollo.mutate({
          mutation: AddToSubsMutation,
          variables: { isbn },
          refetchQueries: [{ query: GetSubsInCartQuery }]
        }).then(suceess => {
          if (suceess) {
            this.alertTitle = '订阅成功'
            this.showAlert = true
            this.alertMsg = `在本书有货时，系统会自动通知您。您可以在'我的/消息通知'里面查看通知或者取消订阅。`
          }
        }).catch(err => {
          this.showAlert = true
          this.alertTitle = '订阅失败'
          this.alertMsg = err.message
        })
      },
      addToBorrowPlan () {
        const expireAt = new Date(`${this.borrowDate}T23:59:59`)
        this.$apollo.mutate({
          mutation: AddToBorrowPlanMutation,
          variables: {
            expireAt,
            bookIds: this.selectedBooks
          },
          refetchQueries: [{
            query: GetBooksInCartQuery
          }, {
            query: GetCartCountQuery
          }, {
            query: GetBooksInPlanQuery,
            variables: {kind: 'BORROW'}
          }]
        }).then(() => {
          this.selectedBooks.forEach(bookId => {
            delete this.selection[bookId]
          })
          this.showAvailable = false
          this.alertTitle = '恭喜'
          this.showAlert = true
          this.alertMsg = `预约成功，请在${dateFormat(expireAt, 'YYYY年MM月DD日')}之前来馆借书，逾期系统将不再为您预留。`
        }).catch(err => {
          console.log(err.message)
          this.showAlert = true
          this.alertTitle = '预约失败'
          this.alertMsg = err.message
        })
      },
      removeFromCart (e, bookId) {
        e.stopPropagation()
        this.$apollo.mutate({
          mutation: RemoveFromCartMutation,
          variables: {bookId},
          refetchQueries: [{query: GetBooksInCartQuery}, {query: GetCartCountQuery}]
        }).then(({data}) => {
          // 从selection中删除，否则canBorrow就会出错
          delete this.selection[bookId]
          this.showAlert = true
          if (data.removeFromCart) {
            this.alertMsg = '成功从购物车中删除！'
          } else {
            this.alertMsg = '图书早就不在购物车中了！'
          }
        })
      },
      moveToCollection (e, bookId) {
        e.stopPropagation()
        this.$apollo.mutate({
          mutation: MoveFromCartToCollection,
          variables: { bookId },
          refetchQueries: [{ query: GetBooksInCartQuery }, {query: GetCartCountQuery}]
        }).then(() => {
          delete this.selection[bookId]
          this.alertMsg = '成功移入收藏夹！'
          this.showAlert = true
        })
      },
      isSelected (bookId) {
        // 因为组件render的时候会调用此方法，所以在这里对selection进行初始化
        if (this.selection[bookId] === undefined) this.selection[bookId] = false
        return !!this.selection[bookId]
      },
      toggleChecked (e, bookId) {
        e.stopPropagation()
        // 使用this.selection[bookId] = !this.selection[bookId]不会触发视图自动更新
        this.selection = { ...this.selection, [bookId]: !this.selection[bookId] }
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
      },
      isAvailable (book) {
        return book.count > book.scheduledCount
      }
    },
    apollo: {
      booksInCart: { query: GetBooksInCartQuery }
    },
    components: { Card, Group, XButton, CellBox, Alert, CheckIcon, Datetime, InlineXSwitch },
    computed: {
      selectedBooks: function () {
        return Object.keys(this.selection).filter(bookId => this.selection[bookId]).filter(bookId => {
          const i = this.booksInCart.findIndex(book => (book.id === bookId))
          return this.booksInCart[i].count > 0
        })
      },
      canBorrow: function () {
        return !!this.selectedBooks.length
      },
      today: function () {
        return dateFormat(new Date(), 'YYYY-MM-DD')
      },
      aWeekLater: function () {
        return dateFormat(new Date(Date.now().valueOf() + 7 * 86400000), 'YYYY-MM-DD')
      }
    }
  }
</script>

<style scoped>
  .rm-mt >>> button + button{
    margin-top: .5rem;
  }
  .rm-mt >>> .weui-cells{
    margin-top: 0;
  }
  .rm-mt >>> .weui-cells:before, .rm-mt >>> .weui-cells:after{
    display: none;
  }
  .rm-mt >>> .weui-btn_mini{
    padding-left: .5rem;
    padding-right: .5rem;
  }
  .pa0.weui-cell.vux-datetime{
    padding: 0;
  }
  @media screen and (device-height:667px){
    .overflow-y-auto >>> .weui-cells{
      height: 510px;
      overflow-y: auto
    }
  }
  @media screen and (device-height:640px){
    .overflow-y-auto >>> .weui-cells{
      height: 485px;
      overflow-y: auto
    }
  }
  @media screen and (device-height:568px){
    .overflow-y-auto >>> .weui-cells{
      height: 412px;
      overflow-y: auto
    }
  }
  @media screen and (device-height:731px){
    .overflow-y-auto >>> .weui-cells{
      height: 569px;
      overflow-y: auto
    }
  }
  @media screen and (device-height:736px){
    .overflow-y-auto >>> .weui-cells{
      height: 569px;
      overflow-y: auto
    }
  }
  @media screen and (device-height:812px){
    .overflow-y-auto >>> .weui-cells{
      height: 655px;
      overflow-y: auto
    }
  }
  @media screen and (device-height:823px){
    .overflow-y-auto >>> .weui-cells{
      height: 666px;
      overflow-y: auto
    }
  }
</style>
