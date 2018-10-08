<template>
  <div class="mh3 h-100 flex flex-column">
    <div v-transfer-dom>
      <loading :show="$apollo.queries.publicKey.loading" text=""></loading>
    </div>
    <div class="flex-auto flex flex-column justify-center">
      <group label-width="60px">
        <h1 slot="title" class="f2 lh-title normal">登录图书馆</h1>
        <x-input title="帐号" v-model="username" placeholder="请填写账号" @on-focus="userInputFocused=true" @on-blur="userInputFocused=false" show-clear></x-input>
        <x-input title="密码" type="password" v-model="password" placeholder="请填写密码" @on-focus="passInputFocused=true" @on-blur="passInputFocused=false" show-clear></x-input>
      </group>
      <x-button type="primary" :disabled="!canSubmit" class="mt4" @click.native="logIn">登录</x-button>
    </div>
    <div class="w-100 tc mb3 flex-none" v-show="showBottomLink">
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
  import client from '../ApolloClient'

  export default {
    name: 'log-in',
    data () {
      return {
        username: '',
        password: '',
        publicKey: '',
        showAlert: false,
        userInputFocused: false,
        passInputFocused: false
      }
    },
    computed: {
      canSubmit () {
        return this.username && this.password
      },
      showBottomLink: function () {
        return !this.userInputFocused && !this.passInputFocused
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
        query: GetPublicKeyQuery,
        error (error) {
          console.log(error.message)
          this.$vux.alert.show({
            title: '出错了',
            content: '获取公钥失败，无法对密码进行加密'
          })
        }
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
