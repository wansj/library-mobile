<template>
  <div class="mh3 pt6 h-100 relative">
    <div v-transfer-dom>
      <loading :show="loadingStatus.loading" text=""></loading>
    </div>
    <group label-width="60px">
      <h1 slot="title" class="f2 lh-title normal">登录图书馆</h1>
      <x-input title="帐号" v-model="username" placeholder="请填写账号" show-clear></x-input>
      <x-input title="密码" type="password" v-model="password" placeholder="请填写密码" show-clear></x-input>
    </group>
    <x-button type="primary" :disabled="!canSubmit" class="mt4" @click.native="logIn">登录</x-button>
    <div class="fixed bottom-1 w-100 tc">
      <router-link tag="a" to="/reset-password" class="br b--silver pr3 pv1">找回密码</router-link>
      <router-link tag="a" to="/signup" class="pl2">注册帐号</router-link>
    </div>
    <div v-transfer-dom>
      <alert v-model="showAlert">帐号或密码错误，请重新填写。</alert>
    </div>
  </div>
</template>

<script>
  import { XInput, XButton, Alert, Loading, Group } from 'vux'
  import { LogInMutation } from '../constants/graphql-mutations'
  import { GetPublicKeyQuery } from '../constants/graphql-queries'
  import { TokenExpiredSubscription } from '../constants/graphql-subscriptions'
  import { encryptPassword } from '../utils'
  import { G_AUTH_TOKEN } from '../constants/settings'
  import { UpdateAuthPayloadMutation } from '../store/AuthPayload'
  import { GetLoadingStatusQuery } from '../store/LoadingStatus'
  import client from '../ApolloClient'

  export default {
    name: 'log-in',
    data () {
      return {
        username: '',
        password: '',
        publicKey: '',
        showAlert: false,
        loadingStatus: null
      }
    },
    computed: {
      canSubmit () {
        return this.username && this.password
      }
    },
    components: {
      XInput,
      XButton,
      Group,
      Alert,
      Loading
    },
    apollo: {
      publicKey: {
        query: GetPublicKeyQuery
      },
      loadingStatus: {
        query: GetLoadingStatusQuery
      }
    },
    methods: {
      logIn () {
        this.$apollo.mutate({
          mutation: LogInMutation,
          variables: { username: this.username, password: encryptPassword(this.password, this.publicKey) }
        }).then(({data}) => {
          localStorage.setItem(G_AUTH_TOKEN, data.logIn.token)
          // 在根组件App上添加Subscription,监听到tokenExpired事件后自动退出登录
          this.$parent.$apollo.addSmartSubscription('tokenExpired', {
            query: TokenExpiredSubscription,
            result ({data}) {
              client.resetStore()
              localStorage.removeItem(G_AUTH_TOKEN)
              this.$router.push('/signin')
            }
          })
          this.$apollo.mutate({
            mutation: UpdateAuthPayloadMutation,
            variables: { token: data.logIn.token, user: data.logIn.user }
          }).then(() => {
            this.$router.push('/')
          })
        }).catch(({ graphQLErrors }) => {
          if (graphQLErrors) {
            console.log(graphQLErrors[0].message)
            this.showAlert = true
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
