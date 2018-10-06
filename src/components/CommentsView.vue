<template>
  <div infinite-wrapper class="scroll-container overflow-container bg-white">
    <card>
      <div slot="header" class="pa3">
        <h1 class="f3 mv0">读者评论</h1>
        <template v-if="bookCommentsProfile">
          <div>
            <rater ref="rater" :font-size="20" disabled></rater>
            <span class="f4 lh-solid normal ml1">{{bookCommentsProfile.count}}</span>
          </div>
          <div class="blue flex justify-between">
            <span>{{bookCommentsProfile.average}}颗星，最多{{bookCommentsProfile.max}}颗星</span>
            <router-link :to="{path: `/books/${bookId}/comments/post?userId=${userId}`}" v-if="!hasUserCommented">我要写评论</router-link>
          </div>
          <div class="bar-chart pt2">
            <div v-for="star in padArray(bookCommentsProfile.group)" :key="star.level" class="flex items-center mb1">
              <div class="blue flex-none star-text">{{star.level}}星</div>
              <div class="bar">
                <div class="bar-inner" :style="{ width: `${star.percent*100}%`}"></div>
              </div>
              <div class="blue flex-none tr percent-text">{{(star.percent * 100).toFixed(0)}}%</div>
            </div>
          </div>
        </template>
        <inline-loading v-else></inline-loading>
      </div>
    </card>
    <div>
      <comment-cell v-for="comment in comments" :key="comment.id" :comment="comment" :skip="skip" :limit="limit" :bookId="bookId" usedInDetails></comment-cell>
      <infinite-loading @infinite="loadMore" ref="infiniteLoading" force-use-infinite-wrapper>
        <span slot="no-more">已经到底啦！</span>
      </infinite-loading>
    </div>
  </div>
</template>

<script>
  import { Card, Rater } from 'vux'
  import InfiniteLoading from 'vue-infinite-loading'
  import { GetBookCommentsQuery, GetBookCommentsProfileQuery, HasUserCommentedForTheBookQuery } from '../constants/graphql-queries'

  export default {
    name: 'comments-view',
    data () {
      return {
        skip: 0,
        limit: 5,
        comments: [],
        // score: 0,
        bookCommentsProfile: null,
        hasUserCommented: false
      }
    },
    methods: {
      padArray (group) {
        let result = []
        for (let i = 5; i > -1; i--) {
          const index = group.findIndex(star => star.level === i)
          if (index > -1) result.push(group[index])
          else result.push({ level: i, percent: 0 })
        }
        return result
      },
      loadMore ($state) {
        this.$apollo.query({
          query: GetBookCommentsQuery,
          variables: {
            skip: this.skip * this.limit,
            limit: this.limit,
            bookId: this.bookId
          }
        }).then(({ data }) => {
          if (data && data.bookComments) {
            this.skip++
            this.addToList(data.bookComments)
            if (data.bookComments.length) $state.loaded()
            else $state.complete()
          }
        })
      },
      addToList (bookComments) {
        const added = bookComments.filter(comment => {
          return !this.comments.some(({ id }) => (id === comment.id))
        })
        if (added.length) {
          this.comments = [...this.comments, ...added]
        }
      }
    },
    apollo: {
      bookCommentsProfile: {
        query: GetBookCommentsProfileQuery,
        variables () {
          return { bookId: this.bookId }
        },
        result ({ data }) {
          if (data) {
            this.bookCommentsProfile = { ...data.bookCommentsProfile }
            // 延迟设置rater，因为要等this.$refs.rater有值才行
            const timer = setTimeout(() => {
              this.$refs.rater.currentValue = this.bookCommentsProfile.average
              clearTimeout(timer)
            }, 200)
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
      Card,
      Rater,
      InfiniteLoading,
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
  .bar{
    position: relative;
    flex: auto;
    height: 2rem;
    border-width: 1px ;
    border-style: inset;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    background-color: lightgray;

  }
  .bar-inner{
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: gold;
  }
  .star-text{
    width: 40px;
    letter-spacing: 5px;
  }
  .percent-text{
    width: 40px;
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
