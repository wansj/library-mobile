<template>
  <div>
    <x-header title="还书预约"></x-header>
    <p class="tc" v-if="$apollo.queries.records.loading || $apollo.queries.booksInPlan.loading">
      <span class="v-mid dib f6">加载中&nbsp;&nbsp;</span><inline-loading></inline-loading>
    </p>
    <template v-else-if="records.length > 0">
      <group title="正在读的书：">
        <cell v-for="record in records" :key="record.id" :title="record.book.title">
          <img slot="icon" :src="recoverPicture(record.book.picture)" class="mr2 w3 h3 book-cover">
          <div slot="inline-desc">
            <p>{{`借阅于：${formatDate(record.date)}`}}</p>
            <p v-if="record.timeout" class="red">已超期</p>
            <p v-else>{{`将于：${formatDate(record.deadline)}到期`}}</p>
          </div>
          <x-button type="primary" mini @click.native="addToList(record.book.id)" :disabled="cantAdd(record)">{{alreadyInPlan(record) ? '已预约' : '加入预约'}}</x-button>
        </cell>
        <datetime v-model="returnDate" title="选择还书时间" :start-date="startDate" :end-date="endDate" required></datetime>
      </group>
      <div class="pa3">
        <x-button type="primary" :disabled="!canMutate" @click.native="mutate">预约还书</x-button>
      </div>
    </template>
    <msg title="对不起" icon="info" description="您没有正在读的书，无法进行预约还书。" v-else></msg>
    <div v-transfer-dom>
      <alert v-model="showAlert" :title="title" :content="content"></alert>
    </div>
  </div>
</template>

<script>
  import { XHeader, XButton, Group, Cell, Msg, Datetime, Alert, dateFormat } from 'vux'
  import { GetRecordsQuery, GetBooksInPlanQuery } from '../constants/graphql-queries'
  import { AddToReturnPlanMutation } from '../constants/graphql-mutations'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'return-plan',
    data () {
      return {
        records: [], // 当前尚未还的图书
        booksInPlan: null, // 已经预定归还的图书
        returnDate: dateFormat(new Date(), 'YYYY-MM-DD'),
        startDate: dateFormat(new Date(), 'YYYY-MM-DD'),
        bookIds: new Set(),
        showAlert: false,
        title: '',
        content: '',
        imgMap: new Map()
      }
    },
    computed: {
      // 限定最大还书日期为预约还的图书中最先到期的一本图书的截止还书日期
      endDate () {
        const sorted = this.records.filter(({ book: { id } }) => this.bookIds.has(id)).sort((a, b) => a.deadline < b.deadline)
        if (sorted.length > 0) {
          return dateFormat(new Date(sorted[0].deadline), 'YYYY-MM-DD')
        }
        return ''
      },
      canMutate: function () {
        return this.bookIds.size > 0
      }
    },
    methods: {
      mutate () {
        this.$apollo.mutate({
          mutation: AddToReturnPlanMutation,
          variables: {
            bookIds: this.bookIds,
            expireAt: new Date(`${this.returnDate}T23:59:59`)
          }
        }).then(() => {
          this.showAlert = true
          this.title = '预约成功'
          this.content = `请于${dateFormat(new Date(this.returnDate), 'YYYY年MM月DD日')}闭馆前来还书。`
        }).catch(e => {
          this.showAlert = true
          this.title = '出错了'
          this.content = e.message
        })
      },
      addToList (bookId) {
        if (!this.bookIds.has(bookId)) this.bookIds = new Set([...this.bookIds.add(bookId)])
      },
      cantAdd (record) {
        return this.bookIds.has(record.book.id)
      },
      alreadyInPlan (record) {
        if (!this.booksInPlan) return false
        return this.booksInPlan.books.some(({ id }) => id === record.book.id)
      },
      formatDate (date) {
        return dateFormat(new Date(date), 'YYYY年MM月DD日')
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
      booksInPlan: {
        query: GetBooksInPlanQuery,
        variables: {kind: 'RETURN'},
        result ({ data }) {
          if (data.booksInPlan && data.booksInPlan.books.length > 0) {
            const bookIds = data.booksInPlan.books.map(({ id }) => id)
            this.bookIds = new Set([...this.bookIds, ...bookIds])
          }
        }
      },
      records: {
        query: GetRecordsQuery,
        variables () {
          return { skip: 0, limit: 0, filter: { state: 'BORROWED' } }
        }
      }
    },
    components: { XHeader, XButton, Group, Cell, Msg, Datetime, Alert }
  }
</script>

<style scoped>

</style>
