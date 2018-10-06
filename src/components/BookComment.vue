<template>
  <group>
    <cell-box :link="{path: `/books/comments/view?bookId=${bookId}&&userId=${userId}`}" v-if="bookCommentsProfile" class="flex flex-column ph3" align-items="flex-start" slot="title">
      <h1 class="normal f3 lh-title">{{bookCommentsProfile.count}}个读者评论</h1>
      <div>
        <rater :value="bookCommentsProfile.average" ref="rater" disabled></rater>
        <span class="f5">{{bookCommentsProfile.average.toFixed(1)}}颗星，最多{{bookCommentsProfile.max}}颗星</span>
      </div>
    </cell-box>
    <comment-cell v-for="(comment, i) in bookComments" :key="comment.id" :comment="comment" :skip="skip" :limit="limit" :bookId="bookId"></comment-cell>
    <cell-box v-if="!hasUserCommented">
      <x-button :disabled="$apollo.queries.hasUserCommented.loading" :link="{path: `/books/${bookId}/comments/post?userId=${userId}`}">
        <div class="flex justify-between center items-center">
          <span>{{bookComments.length ? '我要写评论' : '第一个发表评论'}}</span>
          <x-icon type="ios-arrow-forward" size="16"></x-icon>
        </div>
      </x-button>
    </cell-box>
  </group>
</template>

<script>
  import { CellBox, Group, Rater, XButton } from 'vux'
  import { GetBookCommentsProfileQuery, GetBookCommentsQuery, HasUserCommentedForTheBookQuery } from '../constants/graphql-queries'

  export default {
    name: 'book-comment',
    data () {
      return {
        bookCommentsProfile: null,
        bookComments: [],
        skip: 0,
        limit: 5,
        hasUserCommented: false
      }
    },
    apollo: {
      bookCommentsProfile: {
        query: GetBookCommentsProfileQuery,
        variables () {
          return { bookId: this.bookId }
        },
        result ({ data }) {
          if (data && data.bookCommentsProfile) {
            this.bookCommentsProfile = { ...data.bookCommentsProfile }
            // 延迟设置rater，因为要等this.$refs.rater有值才行
            const timer = setTimeout(() => {
              this.$refs.rater.currentValue = this.bookCommentsProfile.average
              clearTimeout(timer)
            }, 200)
          }
        }
      },
      bookComments: {
        query: GetBookCommentsQuery,
        variables () {
          return {
            skip: this.skip,
            limit: this.limit,
            bookId: this.bookId
          }
        }
      },
      hasUserCommented: {
        query: HasUserCommentedForTheBookQuery,
        variables () {
          return { bookId: this.bookId, userId: this.userId }
        }
      }
    },
    components: {
      CellBox,
      Group,
      Rater,
      XButton,
      'comment-cell': () => import('./CommentCell.vue').then(m => m.default)
    },
    props: {
      bookId: {
        type: String,
        required: true
      },
      userId: {
        type: String,
        required: true
      }
    }
  }
</script>

<style scoped>
  .vux-x-icon {
    fill: rgb(200, 200, 205);
  }
</style>
