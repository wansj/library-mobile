<template>
  <div v-if="bookComments">
    <comment-cell :comment="bookComment" :skip="page" :limit="pageSize" :bookId="bookId" usedInDetails></comment-cell>
    <div class="bg-black-05 pv4 ph3 flex items-center">
      <x-button class="ph0" :disabled="!canPrev" @click.native="goPrev">
        <div class="flex items-center justify-center">
          <x-icon type="ios-arrow-thin-left" size="30"></x-icon>
          <span class="ml2">上一页</span>
        </div>
      </x-button>
      <x-button class="ph0" style="margin-top: 0" :disabled="!canNext" @click.native="goNext">
        <div class="flex items-center justify-center">
          <span class="mr2">下一页</span>
          <x-icon type="ios-arrow-thin-right" size="30"></x-icon>
        </div>
      </x-button>
    </div>
  </div>
</template>

<script>
  import { XButton } from 'vux'
  import { GetBookCommentsQuery, GetBookCommentsProfileQuery } from '../constants/graphql-queries'

  export default {
    name: 'comments-detail',
    components: {
      XButton,
      'comment-cell': () => import('./CommentCell.vue').then(m => m.default)
    },
    data () {
      return {
        bookComments: null,
        bookCommentsProfile: null,
        commentId: this.id,
        page: Number(this.skip),
        pageSize: Number(this.limit),
        savedPage: null
      }
    },
    computed: {
      relativeIndex: function () {
        return this.bookComments.findIndex((comment) => {
          return comment.id === this.commentId
        })
      },
      absoluteIndex: function () {
        return this.relativeIndex + this.skip * this.limit
      },
      bookComment: function () {
        return this.bookComments[this.relativeIndex]
      },
      canPrev: function () {
        return this.absoluteIndex > 0
      },
      canNext: function () {
        return this.absoluteIndex < this.bookCommentsProfile.count - 1
      }
    },
    methods: {
      goPrev () {
        if (this.relativeIndex > 0) {
          this.commentId = this.bookComments[this.relativeIndex - 1]
        } else {
          this.savedPage = this.page
          this.page--
        }
      },
      goNext () {
        if (this.relativeIndex < this.bookComments.length - 1) {
          this.commentId = this.bookComments[this.relativeIndex + 1]
        } else {
          this.savedPage = this.page
          this.page++
        }
      }
    },
    apollo: {
      bookCommentsProfile: {
        query: GetBookCommentsProfileQuery,
        variables () {
          return { bookId: this.bookId }
        }
      },
      bookComments: {
        query: GetBookCommentsQuery,
        variables () {
          return {
            skip: this.page * this.pageSize,
            limit: this.pageSize,
            bookId: this.bookId
          }
        },
        result ({data}) {
          if (data.bookComments) {
            this.bookComments = [...data.bookComments]
            if (this.page > this.savedPage) this.commentId = this.bookComments[0].id
            if (this.page < this.savedPage) this.commentId = this.bookComments[this.bookComments.length - 1].id
          }
        }
      }
    },
    props: {
      id: {
        type: String,
        required: true
      },
      skip: String,
      limit: String,
      bookId: String
    }
  }
</script>

<style scoped>
  .weui-btn.ph0{
    padding-left: 0;
    padding-right: 0;
    margin-right: .5rem;
    margin-left: .5rem;
  }
  .weui-btn_disabled .vux-x-icon {
    fill: rgba(0, 0, 0, 0.3);
  }
</style>
