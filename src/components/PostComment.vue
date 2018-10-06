<template>
  <div class="h-100">
    <x-header :left-options="{backText: ''}" class="bg-transparent">
      <div class="f4 ml4 mid-gray" slot="left">发表书评</div>
      <div :class="{f5: true, gold: true, disabled: !canPost}" slot="right" @click="postComment">发布</div>
    </x-header>
    <div class="bg-white">
      <group :gutter="0">
        <cell title="推荐指数">
          <div>
            <rater v-model="score" :min="1" :font-size="22"></rater>
            <span class="score-desc">{{scoreDesc}}</span>
          </div>
          <img slot="icon" width="20" style="display:block;margin-right:5px;" :src="recoverPicture(book.picture)" v-if="book">
        </cell>
      </group>
      <group :gutter="0">
        <x-input title="标题" placeholder="随便写点什么" v-model="title" :max="50"></x-input>
      </group>
      <group :gutter="0">
        <x-textarea v-model="details" placeholder="说说你的阅读心得，分享给想读的朋友们吧" :rows="16"  :max="600" show-counter></x-textarea>
      </group>
    </div>
    <div v-transfer-dom>
      <alert v-model="showSucessAlert" title="恭喜" content="评论成功！" @on-hide="goBack"></alert>
    </div>
  </div>
</template>

<script>
  import { XHeader, XTextarea, XInput, Group, Rater, Cell, Alert } from 'vux'
  import { GetBookCoverById } from '../constants/graphql-queries'
  import { PostBookCommentMutation } from '../constants/graphql-mutations'
  import { transformUploadToURL } from '../utils'

  export default {
    name: 'post-comment',
    data () {
      return {
        book: null,
        showSucessAlert: false,
        score: 5,
        title: '',
        details: '',
        imgMap: new Map()
      }
    },
    computed: {
      canPost: function () {
        return this.title && this.details
      },
      scoreDesc: function () {
        switch (this.score) {
          case 5:
            return '强烈推荐'
          case 4:
            return '非常推荐'
          case 3:
            return '一般推荐'
          case 2:
            return '不太推荐'
          default:
            return '不值得看'
        }
      }
    },
    methods: {
      postComment () {
        if (this.canPost) {
          const comment = {
            bookId: this.bookId,
            userId: this.userId,
            title: this.title,
            details: this.details,
            score: this.score
          }
          this.$apollo.mutate({
            mutation: PostBookCommentMutation,
            variables: { comment }
          }).then(() => (this.showSucessAlert = true))
        }
      },
      goBack () {
        this.$router.back()
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
      book: {
        query: GetBookCoverById,
        variables () {
          return { id: this.bookId }
        }
      }
    },
    components: { XHeader, XTextarea, XInput, Group, Rater, Cell, Alert },
    props: {
      userId: {
        type: String,
        required: true
      },
      bookId: {
        type: String,
        required: true
      }
    }
  }
</script>

<style scoped>
  .bg-transparent{
    background-color: transparent;
  }
  .disabled.gold{
    color: rgba(255,215,0,.5);
  }
</style>
