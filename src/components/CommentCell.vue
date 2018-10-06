<template>
  <cell-box :is-link="!usedInDetails" @click.native="route(comment.id)" class="flex-column" align-items="flex-start">
    <div v-if="usedInDetails">
      <div>
        <rater :value="comment.score" :font-size="16" disabled></rater>
        <span class="b">{{comment.title}}</span>
      </div>
      <div class="mv2 silver">
        <span>留言者</span>
        <span class="blue">{{comment.user.username}}</span>
        <span>于{{formatDate}}</span>
      </div>
    </div>
    <div v-else>
      <div class="flex justify-start items-center">
        <img :src="recoverPicture(comment.user.photo)" class="w2 h2">
        <span class="f5 normal ml2">{{comment.user.username}}</span>
      </div>
      <div class="lh-copy"><rater :value="comment.score" :font-size="16" disabled></rater></div>
    </div>
    <div :class="{ellipsis: !usedInDetails, 'comment-body': true}">{{comment.details}}</div>
    <template v-if="usedInDetails">
      <div class="mt3 thumb">
        <div v-if="comment.thumbs > 0" class="f6 silver normal lh-copy">{{comment.thumbs}}个人发现此评论有用</div>
        <ApolloMutation :mutation="require('../constants/graphql-mutations').ThumbsBookCommentMutation" :variables="{id: comment.id, userId: logedUser.id}" @done="onDone" v-if="showThumbBtn">
          <template slot-scope="{ mutate, loading, error }">
            <x-button :disabled="loading" @click.native="mutate()" plain><i class="iconfont vux-icon-lib-cc-thumbs-up mr1"></i>有帮助</x-button>
            <div v-transfer-dom v-if="error">
              <alert :value="error" title="出错了" :content="error"></alert>
            </div>
          </template>
          <div v-transfer-dom>
            <alert v-model="showSucessAlert" title="操作成功" content="感谢您的分享！"></alert>
          </div>
        </ApolloMutation>
      </div>
    </template>
  </cell-box>
</template>

<script>
  import { CellBox, XButton, Rater, Alert, dateFormat } from 'vux'
  import { transformUploadToURL } from '../utils'
  import { GetLogedUserQuery } from '../constants/graphql-queries'

  export default {
    name: 'comment-cell',
    data () {
      return {
        logedUser: null,
        showSucessAlert: false,
        imgMap: new Map()
      }
    },
    components: { CellBox, XButton, Rater, Alert },
    apollo: {
      logedUser: GetLogedUserQuery
    },
    methods: {
      route (id) {
        if (!this.usedInDetails) {
          this.$router.push(`/books/comments/${id}?skip=${this.skip}&&limit=${this.limit}&&bookId=${this.bookId}`)
        }
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
        return require('../assets/me.png')
      },
      onDone () {
        this.showSucessAlert = true
      }
    },
    computed: {
      formatDate: function () {
        return dateFormat(new Date(this.comment.postDate), 'YYYY年MM月DD日')
      },
      showThumbBtn: function () {
        return this.logedUser.id !== this.comment.userId
      }
    },
    props: {
      comment: {
        type: Object,
        required: true
      },
      skip: {
        type: Number,
        required: true
      },
      limit: {
        type: Number,
        required: true
      },
      bookId: {
        type: String,
        required: true
      },
      usedInDetails: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

<style scoped>
  .comment-body{
    color: #333;
    line-height: 1.5rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  .ellipsis{
    margin-right: 1.5rem;
    -webkit-line-clamp: 8;
    overflow: hidden;
  }
  .thumb >>> button{
    border-width: 0;padding-right: 0;padding-left: 0;text-align: left;
  }
</style>
