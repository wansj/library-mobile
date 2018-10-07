<template>
  <div class="h-100">
    <div v-transfer-dom>
      <loading :show="loadingStatus.loading" text=""></loading>
    </div>
    <x-header></x-header>
    <div class="mh3 pt5">
      <group label-width="60px" class="no-bt">
        <h1 slot="title" class="f2 lh-title normal">帐号注册</h1>
        <flexbox align="flex-end">
          <flexbox-item class="bb">
            <x-input title="帐号" v-model="username" placeholder="请填写账号" show-clear class="w-80" label-width="60px" required></x-input>
          </flexbox-item>
          <flexbox-item :span="1/5">
            <div class="w3 h3 lh4 bg-light-gray tc ml-auto mr0" @click="selectPicture">
              <img :src="avatarSrc" v-if="avatarSrc" class="w-100 h-100"/>
              <template v-else>
                <i class="iconfont vux-icon-lib-picture"></i>
                <input type="file" accept="image/*;" class="dn" ref="fileInput" @change="uploadAvatar"/>
              </template>
            </div>
          </flexbox-item>
        </flexbox>
        <div class="no-bt">
          <x-input title="密码" type="password" v-model="password" placeholder="请填写密码" :min="6" :max="20" show-clear required></x-input>
        </div>
        <x-input title="单位" v-model="department" placeholder="请填写单位" show-clear required></x-input>
        <popup-picker title="角色" :data="roles" v-model="selectedRole" placeholder="请选择角色" value-text-align="left" show-name>
        </popup-picker>
        <x-input title="邮件" v-model="email" placeholder="请填写邮件地址" is-type="email" show-clear required></x-input>
      </group>
      <x-button type="primary" :disabled="!canSubmit" class="mt4" @click.native="signUp">注册</x-button>
    </div>
    <div v-transfer-dom>
      <alert v-model="showAlert">{{errMsg}}</alert>
    </div>
  </div>
</template>

<script>
  import { XInput, XButton, XHeader, Alert, Loading, PopupPicker, Flexbox, FlexboxItem, Group } from 'vux'
  import { GetLoadingStatusQuery } from '../store/LoadingStatus'
  import { UpdateAuthPayloadMutation } from '../store/AuthPayload'
  import { GetPublicKeyQuery, GetAvailableRolesQuery, GetFileByIDQuery } from '../constants/graphql-queries'
  import { UploadFileMutation, SignUpMutation } from '../constants/graphql-mutations'
  import { transformUploadToURL, encryptPassword } from '../utils'
  import { G_AUTH_TOKEN } from '../constants/settings'

  export default {
    name: 'sign-up',
    data () {
      return {
        username: '',
        password: '',
        department: '',
        email: '',
        avatar: '',
        avatarSrc: '',
        selectedRole: [],
        availableRoles: [],
        showAlert: false,
        errMsg: '',
        loadingStatus: null
      }
    },
    components: {
      XInput,
      XButton,
      XHeader,
      Group,
      Alert,
      Loading,
      PopupPicker,
      Flexbox,
      FlexboxItem
    },
    computed: {
      canSubmit () {
        return this.username && this.password && this.department && this.role && this.email
      },
      roles () {
        if (this.availableRoles.length) {
          const data = this.availableRoles.map(({ name, id }) => ({ name, value: id }))
          return [[...data]]
        }
        return [['']]
      },
      role () {
        return this.selectedRole.length ? this.selectedRole[0] : ''
      }
    },
    apollo: {
      loadingStatus: {
        query: GetLoadingStatusQuery
      },
      availableRoles: {
        query: GetAvailableRolesQuery
      }
    },
    methods: {
      signUp () {
        this.$apollo.query({
          query: GetPublicKeyQuery
        }).then(({data}) => {
          this.$apollo.mutate({
            mutation: SignUpMutation,
            variables: {
              username: this.username,
              password: encryptPassword(this.password, data.publicKey),
              department: this.department,
              role: this.role,
              avatar: this.avatar || null,
              email: this.email
            }
          }).then(({data: {signUp}}) => {
            if (localStorage) localStorage.setItem(G_AUTH_TOKEN, signUp.token)
            this.$apollo.mutate({
              mutation: UpdateAuthPayloadMutation,
              variables: {token: signUp.token, user: signUp.user}
            }).then(() => this.$router.push('/'))
          }).catch(({ graphQLErrors }) => {
            if (graphQLErrors && graphQLErrors.length) {
              this.showAlert = true
              this.errMsg = graphQLErrors[0].message
            }
          })
        })
      },
      selectPicture () {
        this.$refs.fileInput.dispatchEvent(new MouseEvent('click'))
      },
      uploadAvatar () {
        const file = this.$refs.fileInput.files && this.$refs.fileInput.files[0]
        const isImg = /^image\//.test(file.type)
        const isLt1M = file.size / 1024 / 1024 < 1
        if (!isImg) {
          this.showAlert = true
          this.errMsg = '只能选择图片!'
        } else if (!isLt1M) {
          this.showAlert = true
          this.errMsg = '上传图片大小不能超过 1MB!'
        } else {
          this.$apollo.mutate({
            mutation: UploadFileMutation,
            variables: {
              file,
              tag: 'USER'
            }
          }).then(({data}) => {
            this.avatar = data.singleUpload.id
            if (FileReader) {
              const reader = new FileReader()
              reader.onload = e => (this.avatarSrc = e.target.result)
              reader.readAsDataURL(file)
            } else { // 如果不支持FileReader接口，就从服务器请求
              this.$apollo.query({
                query: GetFileByIDQuery,
                variables: { id: data.singleUpload.id }
              }).then(({data}) => {
                this.avatarSrc = transformUploadToURL(data.fileByID.file)
              })
            }
          })
        }
      }
    }
  }
</script>

<style scoped>
  .no-bt >>> .weui-cells:before{
    border-top: none;
  }
  .no-bt >>> .weui-cell:before{
    boder-top: none;
  }
  .lh4{
    line-height: 4rem;
  }
  .bb{
    border-color: #D9D9D9;
  }
</style>
