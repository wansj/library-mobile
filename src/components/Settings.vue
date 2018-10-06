<template>
    <div>
      <x-header :left-options="{backText: ''}" title="设置"></x-header>
      <group>
        <cell link="/feedback" title="用户反馈"></cell>
        <cell link="/privacy" title="隐私声明"></cell>
        <cell link="/aboutMe" title="关于我们"></cell>
      </group>
      <group>
        <cell title="版本号" value="1.0.0"></cell>
        <cell title="使用环境" value="iOS 7+或者Android 4.1+"></cell>
      </group>
      <div class="pa3"><x-button type="primary" @click.native="logOut">退出登录</x-button></div>
      <div v-transfer-dom>
        <alert v-model="showAlert" title="出错了" content="退出登录失败"></alert>
      </div>
    </div>
</template>

<script>
  import { XHeader, Group, Cell, XButton, Alert } from 'vux'
  import { LogOutMutation } from '../constants/graphql-mutations'
  import client from '../ApolloClient'
  import { G_AUTH_TOKEN } from '../constants/settings'

  export default {
    name: 'settings',
    components: { XHeader, Group, Cell, XButton, Alert },
    data () {
      return { showAlert: false }
    },
    methods: {
      logOut () {
        this.$apollo.mutate({
          mutation: LogOutMutation
        }).then(() => {
          client.resetStore()
          localStorage.removeItem(G_AUTH_TOKEN)
          this.$router.push('/signin')
        }).catch(e => {
          // console.log(e.message)
          this.showAlert = true
        })
      }
    }
  }
</script>

<style scoped>

</style>
