<template>
  <div class="h-100">
    <div v-transfer-dom>
      <loading :show="loadingStatus.loading" text=""></loading>
    </div>
    <x-header></x-header>
    <step v-model="stepIndex" class="ma3" background-color='#f4f4f4'>
      <step-item title="填写邮箱"></step-item>
      <step-item title="修改密码"></step-item>
      <step-item title="操作成功"></step-item>
    </step>
    <div class="pt5 mh3">
      <template v-if="stepIndex === 0">
        <group label-width="60px" title="通过邮件发送验证码">
          <x-input title="邮箱" ref="emailInput" is-type="email" v-model="email" placeholder="请输入邮箱地址" required>
            <x-button slot="right" type="primary" mini @click.native="sendCaptcha" :show-loading="showLoading" :text="captchaBtnTxt" :disabled="showLoading"></x-button>
          </x-input>
          <x-input title="验证码" ref="captchaInput" v-model="captcha" :is-type="validateCaptcha" placeholder="请填写邮件中的验证码" required></x-input>
        </group>
        <x-button type="primary" class="mt4" @click.native="gotoPasswordPage">下一步</x-button>
      </template>
      <template v-if="stepIndex === 1">
        <group label-width="60px" title="重置密码">
          <x-input v-model="password" placeholder="请输入新密码" type="password" ref="passwordInput" :min="6" :max="20" required></x-input>
          <x-input v-model="confirm" placeholder="请再次输入密码" type="password" ref="confirmInput" :equalWith="password" :min="6" :max="20" required></x-input>
        </group>
        <x-button type="primary" class="mt4" @click.native="gotoFinishPage">下一步</x-button>
      </template>
      <template v-if="stepIndex === 2">
        <msg :title="msgTitle" :icon="msgIcon" :description="errMsg">
          <template slot="buttons">
            <x-button type="primary" link="/signin">跳转登录</x-button>
            <x-button @click.native="stepIndex=0" :disabled="!errMsg">返回重试</x-button>
          </template>
        </msg>
      </template>
    </div>
    <div v-transfer-dom>
      <alert v-model="showErrAlert">{{errMsg}}</alert>
    </div>
  </div>
</template>

<script>
  import { Alert, Loading, Msg, XButton, XHeader, XInput, Step, StepItem, Group } from 'vux'
  import { GetLoadingStatusQuery } from '../store/LoadingStatus'
  import { GetCaptchaQuery, GetPublicKeyQuery } from '../constants/graphql-queries'
  import { ChangePasswordMutation } from '../constants/graphql-mutations'
  import { encryptPassword } from '../utils'

  export default {
    name: 'reset-password',
    data () {
      return {
        loadingStatus: null,
        stepIndex: 0,
        email: '',
        captcha: '',
        generatedCaptcha: null,
        showLoading: false,
        defaultCaptchaBtnTxt: '验证码',
        showAlert: false,
        errMsg: '发送验证码失败，请稍后尝试。',
        password: '',
        confirm: ''

      }
    },
    computed: {
      captchaBtnTxt () {
        return this.showLoading ? '' : this.defaultCaptchaBtnTxt
      },
      msgIcon () {
        return this.errMsg ? 'cancel' : 'success'
      },
      msgTitle () {
        return this.errMsg ? '操作失败' : '操作成功'
      }
    },
    apollo: {
      loadingStatus: {
        query: GetLoadingStatusQuery
      }
    },
    components: {
      Alert,
      Group,
      Loading,
      Msg,
      XButton,
      XHeader,
      XInput,
      Step,
      StepItem
    },
    methods: {
      validateCaptcha (value) {
        if (!this.generatedCaptcha) return { valid: false, msg: '请点击发送验证码邮件' }
        return {
          valid: value.toLowerCase() === this.generatedCaptcha.toLowerCase(),
          msg: '验证码错误'
        }
      },
      forceShowValidateError (comp) {
        comp.focus()
        comp.blur()
      },
      gotoPasswordPage () {
        if (this.$refs.emailInput.valid && this.$refs.captchaInput.valid) {
          this.stepIndex++
        } else {
          this.forceShowValidateError(this.$refs.emailInput)
          this.forceShowValidateError(this.$refs.captchaInput)
        }
      },
      gotoFinishPage () {
        if (this.$refs.passwordInput.valid && this.$refs.confirmInput.valid) {
          this.$apollo.query({
            query: GetPublicKeyQuery
          }).then(({data}) => {
            this.$apollo.mutate({
              mutation: ChangePasswordMutation,
              variables: { email: this.email, password: encryptPassword(this.password, data.publicKey) }
            }).then(() => {
              this.errMsg = ''
              this.stepIndex++
            }).catch(({ graphQLErrors, networkError }) => {
              if (graphQLErrors && graphQLErrors.length) {
                this.errMsg = `密码重置失败，原因是：${graphQLErrors[0].message}`
              }
              if (networkError) this.errMsg = `密码重置失败，原因是：${networkError.message}`
              this.stepIndex++
            })
          }).catch(() => {
            this.errMsg = '获取公钥失败，无法对密码进行加密。'
            this.stepIndex++
          })
        } else {
          this.forceShowValidateError(this.$refs.passwordInput)
          this.forceShowValidateError(this.$refs.confirmInput)
        }
      },
      sendCaptcha () {
        const emailInput = this.$refs.emailInput
        if (emailInput.valid) {
          this.showLoading = true
          this.$apollo.query({
            query: GetCaptchaQuery,
            variables: { email: this.email }
          }).then(({ data: { getCaptcha } }) => {
            this.generatedCaptcha = getCaptcha
            this.showLoading = false
          }).catch(({ graphQLErrors }) => {
            if (graphQLErrors && graphQLErrors.length) {
              this.errMsg = graphQLErrors[0].message
            }
            this.showLoading = false
            this.showAlert = true
          })
        } else {
          this.forceShowValidateError(emailInput)
        }
      }
    }
  }
</script>

<style scoped>
  /*.vux-step-item.custom >>> .vux-step-item-main{*/
    /*background-color: transparent !important;*/
  /*}*/
</style>
