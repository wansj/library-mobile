<template>
  <ApolloQuery :query="require('../constants/graphql-queries').GetBookById" :variables="{id}">
    <template slot-scope="{ result: { loading, error, data } }">
      <div v-if="loading" class="loading apollo">Loading...</div>
      <div v-else-if="error" class="error apollo">An error occured</div>
      <div v-else-if="data && data.book" class="overflow-y-auto scroll-container">
        <div class="bg-white">
          <div class="flex pv3">
            <img :src="recoverPicture(data.book.picture)" class="center w4 h4">
          </div>
          <form-preview header-label="图书名称" :header-value="titleDesc(data.book)" :body-items="propsList(data.book)" :footer-buttons="buttons" :name="data.book.id"></form-preview>
        </div>
        <div class="bg-white mt2 pt1 pb2" v-if="data.book.summary">
          <h1 class="normal ma3 mt2 f3 lh-title">图书简介</h1>
          <div class="mt0 mb3 mh3 ph3 pv2 ba b--moon-gray br2">
            <div class="flex justify-between">
              <div class="f4">描述</div>
              <div class="blue f5" v-if="!summaryOpened" @click="summaryOpened=!summaryOpened">收起</div>
            </div>
            <div :class="summaryCls">{{data.book.summary}}</div>
            <div class="tr blue mt1"v-if="summaryOpened" @click="summaryOpened=!summaryOpened">查看全部</div>
          </div>
        </div>
        <div class="bg-white mt2 pv2">
          <book-comment :bookId="id" :userId="logedUser.id" v-if="logedUser"></book-comment>
        </div>
      </div>
      <div v-transfer-dom>
        <alert v-model="showAlert" :title="alertTitle" :content="alertMsg"></alert>
      </div>
      <div v-transfer-dom>
        <alert v-model="showAlert" :title="alertTitle" :content="alertMsg"></alert>
      </div>
    </template>
  </ApolloQuery>
</template>

<script>
  import { FormPreview, Alert, dateFormat } from 'vux'
  import { transformUploadToURL } from '../utils'
  import { AddToCollectionMutation, AddToCartMutation } from '../constants/graphql-mutations'
  import { GetLogedUserQuery, GetCartCountQuery, GetBooksInCartQuery } from '../constants/graphql-queries'

  export default {
    name: 'book-details',
    components: {
      FormPreview,
      Alert,
      'book-comment': () => import('./BookComment.vue').then(m => m.default)
    },
    data () {
      return {
        logedUser: null,
        showAlert: false,
        alertTitle: '',
        alertMsg: '',
        count: 0,
        buttons: [{
          style: 'primary',
          text: '加入书单',
          onButtonClick: () => {
            this.$apollo.mutate({
              mutation: AddToCartMutation,
              variables: {
                userId: this.logedUser.id,
                bookId: this.id
              },
              refetchQueries: [{query: GetCartCountQuery}, {query: GetBooksInCartQuery}]
            }).then(({ data }) => {
              this.showAlert = true
              if (data.addToCart) {
                this.alertTitle = '恭喜'
                this.alertMsg = '加入书单成功！'
              } else {
                this.alertTitle = '提示'
                this.alertMsg = '图书已经在书单里面了！'
              }
              this.buttons.splice(0, 1, { style: 'primary', text: '已加书单' })
            })
          }
        }, {
          style: 'default',
          text: '收藏此书',
          onButtonClick: () => {
            this.$apollo.mutate({
              mutation: AddToCollectionMutation,
              variables: {
                userId: this.logedUser.id,
                bookId: this.id
              }
            }).then(({ data }) => {
              this.showAlert = true
              if (data.addToCollection) {
                this.alertTitle = '恭喜'
                this.alertMsg = '收藏成功！'
              } else {
                this.alertTitle = '提示'
                this.alertMsg = '您已经收藏过本书了！'
              }
              this.buttons.splice(1, 1, { style: 'default', text: '已经收藏' })
            })
          }
        }],
        summaryOpened: true,
        imgMap: new Map()
      }
    },
    computed: {
      summaryCls: function () {
        return { ellipsis: true, 'overflow-hidden': this.summaryOpened, 'three-lines': this.summaryOpened }
      }
    },
    apollo: {
      logedUser: { query: GetLogedUserQuery }
    },
    methods: {
      titleDesc ({title, volume, version}) {
        return `${title}${volume > 1 ? `（共${volume}册）` : ''}（第${version}版）`
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
      locationDesc (location) {
        const [shelf, floor] = location.split('-')
        return `${shelf}号书架，第${floor}层`
      },
      propsList (book) {
        const props = [{
          label: 'ISBN',
          value: book.isbn
        }, {
          label: '作者',
          value: book.authors.join(', ')
        }]
        if (book.translators) {
          props.push({
            label: '译者',
            value: book.translators.join(', ')
          })
        }
        props.push({
          label: '出版社',
          value: book.publisher
        })
        if (book.pubDate) {
          props.push({
            label: '出版日期',
            value: dateFormat(new Date(book.pubDate), 'YYYY年MM月DD日')
          })
        }
        if (book.category) {
          props.push({
            label: '图书类别',
            value: book.category
          })
        }
        if (book.location) {
          props.push({
            label: '存放位置',
            value: this.locationDesc(book.location)
          })
        }
        props.push({
          label: '库存数量',
          value: book.count
        })
        if (book.price) {
          props.push({
            label: '单价',
            value: book.price
          })
        }
        return props
      }
    },
    props: {
      id: {
        type: String,
        required: true
      }
    }
  }
</script>

<style scoped>
  .ellipsis{
    line-height: 1.5rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  .three-lines{
    -webkit-line-clamp: 3;
  }
  @media screen and (device-height:667px){
    .scroll-container{
      height: 630px;
    }
  }
  @media screen and (device-height:640px){
    .scroll-container{
      height: 600px;
    }
  }
  @media screen and (device-height:568px){
    .scroll-container{
      height: 530px;
    }
  }
  @media screen and (min-device-height:730px){
    .scroll-container{
      height: 700px;
    }
  }
  @media screen and (min-device-height:800px){
    .scroll-container{
      height: 800px;
    }
  }
</style>
