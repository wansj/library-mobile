<template>
  <div>
    <x-header title="用户反馈"></x-header>
    <group title="BUG报告">
      <x-textarea placeholder="请输入问题描述" v-model="bugReport"></x-textarea>
    </group>
    <group title="改进建议">
      <x-textarea placeholder="您希望添加什么功能？" v-model="proposal"></x-textarea>
    </group>
    <div class="pa3"><x-button type="primary" @click.native="commit" :disabled="!canPost">提交</x-button></div>
    <div v-transfer-dom>
      <alert v-model="showAlert" :title="title" :content="content"></alert>
    </div>
  </div>
</template>

<script>
  import { Group, XTextarea, XHeader, XButton, Alert } from 'vux'
  import { CommitFeedbackMutation } from '../constants/graphql-mutations'

  export default {
    name: 'feedback',
    data () {
      return {
        bugReport: '',
        proposal: '',
        title: '',
        content: '',
        showAlert: false
      }
    },
    methods: {
      commit () {
        let p1 = Promise.resolve(true)
        let p2 = Promise.resolve(true)
        if (this.bugReport.trim().length > 0) {
          p1 = this.$apollo.mutate({
            mutation: CommitFeedbackMutation,
            variables: { category: 'BUG', description: this.bugReport.trim() }
          })
        }
        if (this.proposal.trim().length > 0) {
          p2 = this.$apollo.mutate({
            mutation: CommitFeedbackMutation,
            variables: { category: 'ADVICE', description: this.proposal.trim() }
          })
        }
        Promise.all([p1, p2]).then(() => {
          this.showAlert = true
          this.bugReport = ''
          this.proposal = ''
          this.title = '提交成功'
          this.content = '感谢您帮助我们改进产品！'
        }).catch(e => {
          this.showAlert = true
          this.title = '出错了'
          this.content = e.message
        })
      }
    },
    computed: {
      canPost: function () {
        return this.bugReport.trim().length > 0 || this.proposal.trim().length > 0
      }
    },
    components: {Group, XTextarea, XHeader, XButton, Alert}
  }
</script>

<style scoped>

</style>
